from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import cv2
from rembg import remove
from PIL import Image
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/tryon")
async def try_on(user_image: UploadFile = File(...), cloth_image: UploadFile = File(...)):

    # save files
    with open("user.jpg", "wb") as f:
        shutil.copyfileobj(user_image.file, f)

    with open("cloth.jpg", "wb") as f:
        shutil.copyfileobj(cloth_image.file, f)

    # remove background of cloth
    cloth_input = Image.open("cloth.jpg")
    cloth_no_bg = remove(cloth_input)
    cloth_no_bg.save("cloth_removed.png")

    # read images
    user = cv2.imread("user.jpg")
    cloth = cv2.imread("cloth_removed.png", cv2.IMREAD_UNCHANGED)

    h, w = user.shape[:2]

    # resize cloth
    cloth = cv2.resize(cloth, (w//3, h//3))

    ch, cw = cloth.shape[:2]

    x = w // 3
    y = h // 4

    # split alpha
    if cloth.shape[2] == 4:
        alpha = cloth[:, :, 3] / 255.0
        for c in range(3):
            user[y:y+ch, x:x+cw, c] = (
                alpha * cloth[:, :, c] +
                (1 - alpha) * user[y:y+ch, x:x+cw, c]
            )
    else:
        user[y:y+ch, x:x+cw] = cloth

    cv2.imwrite("output.jpg", user)

    return FileResponse("output.jpg", media_type="image/jpeg")