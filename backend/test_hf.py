from gradio_client import Client, handle_file
import os

def test_tryon():
    try:
        client = Client("yisol/IDM-VTON")
        print("Connected to IDM-VTON space.")
        
        # We need sample images for testing
        # I'll just use dummy paths if they don't exist
        user_img = "test_user.jpg"
        cloth_img = "test_cloth.jpg"
        
        # Creating dummy images if they don't exist just to test the connection
        if not os.path.exists(user_img):
            with open(user_img, "wb") as f: f.write(b"dummy")
        if not os.path.exists(cloth_img):
            with open(cloth_img, "wb") as f: f.write(b"dummy")
            
        print("Attempting prediction...")
        result = client.predict(
            dict={"background": handle_file(user_img), "layers": [], "composite": None},
            garm_img=handle_file(cloth_img),
            garment_des="a stylish shirt",
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon"
        )
        print("Result:", result)
    except Exception as e:
        print("Error during prediction:", e)

if __name__ == "__main__":
    test_tryon()
