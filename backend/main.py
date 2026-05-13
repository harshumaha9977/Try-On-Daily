print("DEBUG: Application starting...")
import os
import asyncio
import sys
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import io
import base64
import requests
import stripe
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from PIL import Image
import numpy as np
import math

print("DEBUG: Importing local modules...")
from auth import verify_password, get_password_hash, create_access_token, decode_token
from database import get_db, init_db, User, Job
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

print("DEBUG: Basic imports completed successfully.")

# Health Check for Render
app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Load API keys from .env file
import dotenv
dotenv.load_dotenv(override=True)
print("DEBUG: REPLICATE_API_TOKEN is", os.getenv("REPLICATE_API_TOKEN"))

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("outputs"):
    os.makedirs("outputs")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

job_queue = asyncio.Queue()

# App Version for Update Feature
CURRENT_APP_VERSION = "1.0.9"

@app.get("/version")
async def get_version():
    return {"version": CURRENT_APP_VERSION}

@app.get("/latest-apk")
async def download_apk():
    # Return the latest APK file from the desktop
    apk_path = "/Users/harshalmahajan/Desktop/TryON-Final-Tunnel.apk"
    if os.path.exists(apk_path):
        from fastapi.responses import FileResponse
        return FileResponse(apk_path, media_type='application/vnd.android.package-archive', filename="TryON-Daily-Latest.apk")
    return {"error": "APK not found on server"}

# Init database and background tasks on startup
@app.on_event("startup")
async def startup_event():
    await init_db()
    asyncio.create_task(process_jobs())

# ================== JWT AUTH MODELS ==================
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

# POST /register
@app.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == req.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = get_password_hash(req.password)
    new_user = User(
        email=req.email,
        name=req.name,
        hashed_password=hashed,
        credits=10,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "credits": new_user.credits
        }
    }

# POST /login
@app.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == req.email))
    user = result.scalars().first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": str(user.id), "email": user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "credits": user.credits
        }
    }

# GET /me — get current user info
@app.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        user_id = int(current_user["sub"])
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
        
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "credits": user.credits
    }
# =====================================================

# -----------------------------------------------------

def overlay_transparent(background, overlay, x, y, person_mask=None):
    """
    Overlays a transparent PNG onto a background image safely handling boundaries.
    Applies edge feathering to the overlay for a smoother blend.
    If person_mask is provided, prevents clothing from bleeding into the background.
    """
    bg_h, bg_w, bg_channels = background.shape
    ol_h, ol_w, ol_channels = overlay.shape

    if ol_channels < 4:
        y_end = min(y + ol_h, bg_h)
        x_end = min(x + ol_w, bg_w)
        background[max(0, y):y_end, max(0, x):x_end] = overlay[0:y_end-max(0,y), 0:x_end-max(0,x)]
        return background

    y1, y2 = max(0, y), min(bg_h, y + ol_h)
    x1, x2 = max(0, x), min(bg_w, x + ol_w)

    y1o, y2o = max(0, -y), min(ol_h, bg_h - y)
    x1o, x2o = max(0, -x), min(ol_w, bg_w - x)

    if y1 >= y2 or x1 >= x2 or y1o >= y2o or x1o >= x2o:
        return background

    # Use multi-band blending for realistic transitions
    alpha = overlay[y1o:y2o, x1o:x2o, 3] / 255.0
    alpha = cv2.GaussianBlur(alpha, (7, 7), 0) # More smoothing

    # Person-mask refinement
    if person_mask is not None:
        local_mask = person_mask[y1:y2, x1:x2]
        local_mask = cv2.GaussianBlur(local_mask, (11, 11), 0)
        alpha = alpha * local_mask

    # Color adjustment (Matching lighting of the cloth to the person)
    overlay_rgb = overlay[y1o:y2o, x1o:x2o, :3]
    
    # Simple brightness matching
    target_roi = background[y1:y2, x1:x2]
    avg_bg = np.mean(target_roi)
    avg_overlay = np.mean(overlay_rgb)
    brightness_ratio = avg_bg / (avg_overlay + 1e-6)
    overlay_rgb = cv2.convertScaleAbs(overlay_rgb, alpha=brightness_ratio, beta=0)

    alpha_3d = np.expand_dims(alpha, axis=2)
    background[y1:y2, x1:x2] = alpha_3d * overlay_rgb + (1 - alpha_3d) * background[y1:y2, x1:x2]
    return background


# ================== PAYMENTS (Phase 3) ==================
@app.post("/create-checkout-session")
async def create_checkout_session(plan: str = Form(...), is_annual: bool = Form(...)):
    try:
        # These are dummy price IDs, to be replaced with real Stripe Price IDs
        price_id = "price_annual" if is_annual else "price_monthly"
        
        if stripe.api_key == "sk_test_placeholder":
            # If no key, return a mock success URL so the app doesn't break
            return {"url": "http://localhost:5173/studio?payment_success=true"}

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'Try-ON {plan} Plan',
                    },
                    'unit_amount': 18000 if is_annual else 2900,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:5173/studio?success=true',
            cancel_url='http://localhost:5173/studio?canceled=true',
        )
        return {"url": session.url}
    except Exception as e:
        return {"error": str(e)}
# ========================================================

# ================== CONTACT FORM (Phase 6) ==================
class ContactForm(BaseModel):
    name: str
    email: str
    message: str

@app.post("/contact")
async def handle_contact(form: ContactForm):
    """Receives contact form data and sends an email notification."""
    
    EMAIL_USER = os.getenv("EMAIL_USER", "tryon.dailyer@gmail.com")
    EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD", "")
    
    if not EMAIL_APP_PASSWORD:
        # If no app password configured, just log and return success
        print(f"📩 Contact Form Received (no email configured):")
        print(f"   Name: {form.name}")
        print(f"   Email: {form.email}")
        print(f"   Message: {form.message}")
        return {"status": "received", "message": "Thank you! We will get back to you soon."}
    
    try:
        # Build the email
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = EMAIL_USER
        msg['Subject'] = f"🔔 New Contact from Try-ON daily: {form.name}"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #26a69a;">New Contact Form Submission</h2>
            <hr>
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Email:</strong> {form.email}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">{form.message}</p>
            <hr>
            <p style="color: #888; font-size: 12px;">Sent from Try-ON daily Contact Form</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Send via Gmail SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_USER, EMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Contact email sent successfully for: {form.name}")
        return {"status": "sent", "message": "Thank you! We will get back to you soon."}
        
    except Exception as e:
        print(f"❌ Failed to send contact email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again later.")
# ============================================================


# --- WATERMARK LOGIC ---
def add_watermark(image_path):
    try:
        from PIL import Image, ImageDraw, ImageFont
        img = Image.open(image_path)
        draw = ImageDraw.Draw(img)
        text = "Try-On Daily"
        try:
            font = ImageFont.truetype("arial.ttf", 36)
        except IOError:
            font = ImageFont.load_default()
        
        # Position at bottom right
        width, height = img.size
        try:
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
        except AttributeError:
            text_width, text_height = draw.textsize(text, font=font)
        
        x = width - text_width - 20
        y = height - text_height - 20
        
        padding = 10
        draw.rectangle(
            [x - padding, y - padding, x + text_width + padding, y + text_height + padding],
            fill=(0, 0, 0, 128)
        )
        draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
        # 2. Sharpen result (Premium HD look)
        try:
            import cv2
            import numpy as np
            cv_img = cv2.imread(image_path)
            if cv_img is not None:
                kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
                sharpened = cv2.filter2D(cv_img, -1, kernel)
                cv2.imwrite(image_path, sharpened)
        except Exception as e:
            print(f"Sharpen error: {e}")
            
        img.save(image_path)
    except Exception as e:
        print(f"Watermark/Post-process error: {e}")

# --- BACKGROUND WORKER ---
async def process_jobs():
    import time
    import replicate
    from gradio_client import Client, handle_file
    from database import AsyncSessionLocal, Job
    
    while True:
        job_data = await job_queue.get()
        job_id = job_data["job_id"]
        user_temp = job_data["user_temp"]
        cloth_temp = job_data["cloth_temp"]
        category = job_data["category"]
        
        # --- PREPROCESSING (Inspired by DM-VTON) ---
        try:
            from PIL import Image
            from rembg import remove
            
            # 1. Clean Garment Image (Remove Background)
            # This is crucial for AI to only focus on the cloth
            print(f"🧹 [PREPROCESS] Cleaning garment background for {job_id}")
            with open(cloth_temp, "rb") as i:
                input_cloth = i.read()
                output_cloth = remove(input_cloth)
                # Convert back to RGB for AI compatibility (some models hate transparency)
                cloth_img = Image.open(io.BytesIO(output_cloth)).convert("RGBA")
                background = Image.new("RGBA", cloth_img.size, (255, 255, 255, 255))
                new_cloth = Image.alpha_composite(background, cloth_img).convert("RGB")
                new_cloth.save(cloth_temp, "JPEG", quality=95)

            # 2. Resize both images for stability
            for p in [user_temp, cloth_temp]:
                img = Image.open(p)
                img.thumbnail((768, 1024), Image.Resampling.LANCZOS)
                img.save(p)
                
            print(f"✅ [PREPROCESS] Finished for {job_id}")
        except Exception as e:
            print(f"⚠️ Preprocessing error (skipping): {e}")
        
        print(f"🚀 [QUEUE] Processing Job {job_id}")
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Job).filter(Job.id == job_id))
            job = result.scalars().first()
            if job:
                job.status = "processing"
                await db.commit()
        
        success = False
        output_img_path = None
        error_msg = ""
        
        try:
            # --- ATTEMPT 1: SEGMIND (PAID/STABLE) ---
            SEGMIND_API_KEY = os.getenv("SEGMIND_API_KEY")
            if SEGMIND_API_KEY:
                try:
                    import base64
                    def file_to_base64(path):
                        with open(path, "rb") as f:
                            return base64.b64encode(f.read()).decode('utf-8')
                    
                    vton_category = "upper_body"
                    cat_lower = category.lower()
                    if cat_lower in ["bottoms", "pants", "shorts", "lower_body"]:
                        vton_category = "lower_body"
                    elif cat_lower in ["dresses", "dress"]:
                        vton_category = "dresses"
                    elif cat_lower in ["hair", "glasses", "watches", "shoes"]:
                        # Segmind VTON is for clothes, but we'll try upper_body as fallback
                        # or could use a different endpoint here in future
                        vton_category = "upper_body"

                    print(f"📡 [SEGMIND] Trying Job {job_id}")
                    payload = {
                        "human_img": file_to_base64(user_temp),
                        "garm_img": file_to_base64(cloth_temp),
                        "garment_des": f"a stylish {category}",
                        "category": vton_category,
                        "crop": False,
                        "seed": 42,
                        "steps": 30
                    }
                    headers = {"x-api-key": SEGMIND_API_KEY}
                    response = requests.post("https://api.segmind.com/v1/idm-vton", json=payload, headers=headers, timeout=90)
                    if response.status_code == 200:
                        output_img_path = f"outputs/{job_id}.jpg"
                        with open(output_img_path, "wb") as f: f.write(response.content)
                        success = True
                        print(f"✅ [SEGMIND] Success for {job_id}")
                except Exception as e:
                    print(f"⚠️ Segmind failed: {e}")

            # --- ATTEMPT 2: FREE SPACES WITH RETRIES ---
            if not success:
                print(f"🔄 [FALLBACK] Starting Free Server attempts for {job_id}")
                # Rotating through multiple spaces for better success rate
                spaces = [
                    "yisol/IDM-VTON",
                    "zyflzxy/IDM-VTONS",
                    "cocktailpeanut/IDM-VTON",
                    "allAI-tools/IDM-VTON",
                    "levihsu/OOTDiffusion"
                ]
                max_retries = 2 # Per space
                for space_id in spaces:
                    if success: break
                    for attempt in range(max_retries):
                        if success: break
                        try:
                            print(f"📡 [GRADIO] Trying {space_id} (Attempt {attempt+1})")
                            client = Client(space_id)
                            
                            if "IDM-VTON" in space_id:
                                result = client.predict(
                                    dict={"background": handle_file(user_temp), "layers": [], "composite": None},
                                    garm_img=handle_file(cloth_temp),
                                    garment_des=f"a stylish {category}",
                                    is_checked=True,
                                    is_checked_crop=False,
                                    denoise_steps=30,
                                    seed=42,
                                    api_name="/tryon"
                                )
                                tmp_out = result[0]
                            else: # OOTDiffusion
                                oot_cat = "Upper-body"
                                if category.lower() in ["bottoms", "pants"]: oot_cat = "Lower-body"
                                if category.lower() in ["dresses"]: oot_cat = "Dress"
                                result = client.predict(
                                    vton_img=handle_file(user_temp),
                                    garm_img=handle_file(cloth_temp),
                                    category=oot_cat,
                                    n_samples=1,
                                    n_steps=20,
                                    image_scale=2.0,
                                    seed=-1,
                                    api_name="/process_dc"
                                )
                                if isinstance(result, list) and len(result) > 0:
                                    tmp_out = result[0]['image']
                                else: continue

                            output_img_path = f"outputs/{job_id}.jpg"
                            import shutil
                            shutil.copyfile(tmp_out, output_img_path)
                            
                            # Verify if black
                            from PIL import Image, ImageStat
                            img = Image.open(output_img_path).convert('L')
                            if ImageStat.Stat(img).mean[0] > 10:
                                success = True
                                print(f"✅ [GRADIO] Success for {job_id} using {space_id}")
                                break
                        except Exception as e:
                            print(f"⚠️ {space_id} error: {e}")
                            await asyncio.sleep(1)
                    
                    if not success and attempt < max_retries - 1:
                        print(f"⏳ [RETRY] All spaces busy. Waiting 10s before attempt {attempt+2}...")
                        await asyncio.sleep(10)
        except Exception as e:
            error_msg = str(e)
            print(f"❌ [CRITICAL] Job {job_id} system error: {e}")
        if os.path.exists(user_temp): os.remove(user_temp)
        if os.path.exists(cloth_temp): os.remove(cloth_temp)

        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Job).filter(Job.id == job_id))
            job = result.scalars().first()
            if job:
                # Extra check: if success but image is black/empty, mark as failed
                if success and output_img_path:
                    try:
                        from PIL import Image, ImageStat
                        img = Image.open(output_img_path).convert('L')
                        stat = ImageStat.Stat(img)
                        if stat.mean[0] < 10: # Threshold for black
                            success = False
                            error_msg = "AI generated a black image. Server might be busy."
                    except: pass

                if success:
                    add_watermark(output_img_path)
                    job.status = "completed"
                    job.result_url = f"/outputs/{job_id}.jpg"
                else:
                    job.status = "failed"
                    job.error_msg = error_msg or "AI servers busy."
                await db.commit()

        job_queue.task_done()

# --- NEW QUEUE-BASED TRYON API ---
@app.post("/tryon")
async def try_on(current_user: dict = Depends(get_current_user), user_image: UploadFile = File(...), cloth_image: UploadFile = File(...), category: str = Form("tops"), db: AsyncSession = Depends(get_db)):
    try:
        user_id = int(current_user["sub"])
        
        # Credit Check
        from database import User
        res_user = await db.execute(select(User).filter(User.id == user_id))
        db_user = res_user.scalars().first()
        if not db_user or db_user.credits <= 0:
            raise HTTPException(status_code=400, detail="Insufficient credits. Please check-in or watch an ad.")
            
        user_bytes = await user_image.read()
        cloth_bytes = await cloth_image.read()
        
        import uuid
        request_id = str(uuid.uuid4())[:8]
        user_temp = f"temp_u_{request_id}.jpg"
        cloth_temp = f"temp_c_{request_id}.jpg"
        
        with open(user_temp, "wb") as f: f.write(user_bytes)
        with open(cloth_temp, "wb") as f: f.write(cloth_bytes)
        
        from database import Job
        new_job = Job(id=request_id, user_id=user_id, status="pending")
        db.add(new_job)
        
        # ACTUALLY SUBTRACT THE CREDIT NOW
        db_user.credits -= 1
        
        await db.commit()
        
        job_data = {
            "job_id": request_id,
            "user_id": user_id,
            "user_temp": user_temp,
            "cloth_temp": cloth_temp,
            "category": category
        }
        await job_queue.put(job_data)
        
        return {"job_id": request_id, "status": "pending", "position": job_queue.qsize()}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/job/{job_id}")
async def get_job_status(job_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"])
    from database import Job
    result = await db.execute(select(Job).filter(Job.id == job_id, Job.user_id == user_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "job_id": job.id,
        "status": job.status,
        "result_url": job.result_url,
        "error_msg": job.error_msg,
        "position": job_queue.qsize() if job.status == "pending" else 0
    }

@app.get("/jobs/history")
async def get_job_history(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"])
    from database import Job
    result = await db.execute(
        select(Job)
        .filter(Job.user_id == user_id, Job.status == "completed")
        .order_by(Job.created_at.desc())
        .limit(20)
    )
    jobs = result.scalars().all()
    return [{
        "job_id": j.id,
        "result_url": f"{j.result_url}"
    } for j in jobs]

@app.post("/checkin")
async def daily_checkin(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"])
    result = await db.execute(select(User).filter(User.id == user_id))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    if db_user.last_checkin_date == today:
        return {"message": "Already checked in today", "credits_added": 0, "total_credits": db_user.credits}
        
    db_user.credits += 2
    db_user.last_checkin_date = today
    await db.commit()
    
    return {"message": "Daily check-in successful!", "credits_added": 2, "total_credits": db_user.credits}

@app.post("/use-credit")
async def use_credit(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user_id = int(current_user["sub"])
    result = await db.execute(select(User).filter(User.id == user_id))
    db_user = result.scalars().first()
    if db_user:
        if db_user.credits > 0:
            db_user.credits -= 1
            await db.commit()
            return {"message": "Credit used", "new_total": db_user.credits}
        else:
            raise HTTPException(status_code=400, detail="Not enough credits")
    return {"error": "User not found"}

@app.post("/add-credit")
async def add_credit(amount_data: dict, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    amount = amount_data.get("amount", 0)
    # Re-fetch user to ensure we have a valid session
    user_id = int(current_user["sub"])
    result = await db.execute(select(User).filter(User.id == user_id))
    db_user = result.scalars().first()
    if db_user:
        db_user.credits += amount
        await db.commit()
        return {"message": f"Added {amount} credits", "new_total": db_user.credits}
    return {"error": "User not found"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)