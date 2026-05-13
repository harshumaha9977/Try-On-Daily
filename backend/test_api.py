import replicate
import dotenv
import os

dotenv.load_dotenv(override=True)
token = os.getenv("REPLICATE_API_TOKEN")

try:
    client = replicate.Client(api_token=token)
    print("Testing fashn-ai prediction...")
    output = client.run(
        "fashn-ai/fashn-tryon",
        input={
            "model_image": "https://replicate.delivery/pbxt/KRCQZ8D35ZJqD8pXq08AOh6X2U6H3YtN1gXq/1.jpg",
            "garment_image": "https://replicate.delivery/pbxt/KRCQZ8D35ZJqD8pXq08AOh6X2U6H3YtN1gXq/1.jpg",
            "category": "tops"
        }
    )
    print("Success! Output:", output)
except Exception as e:
    print("Replicate failed:", e)
