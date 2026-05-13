import os
import replicate
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("REPLICATE_API_TOKEN")
print(f"Testing token: {token[:5]}...")

try:
    # Testing the new model (cuuupid/idm-vton)
    # Just checking if we can get the model info (this doesn't cost anything)
    model = replicate.models.get("cuuupid/idm-vton")
    print("✅ Successfully found model: cuuupid/idm-vton")
    
    # Check if the version exists
    version = model.versions.get("0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985")
    print("✅ Successfully found version: 0513734a...")
    
except Exception as e:
    print("❌ Model check failed:", e)
