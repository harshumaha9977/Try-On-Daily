import os
import replicate
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("REPLICATE_API_TOKEN")
print(f"Testing token: {token[:5]}...")

try:
    # Try a very cheap/fast model just to verify the token
    # hello-world is usually free/fast
    output = replicate.run(
        "replicate/hello-world:5da8bc8279ef601712a32506e696238b7f7396a603957262024505f03d526e3f",
        input={"text": "test"}
    )
    print("✅ Token is working. Output:", output)
except Exception as e:
    print("❌ Token failed:", e)
