import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    uri = os.getenv("MONGODB_URI")
    print(f"Testing URI: {uri}")
    try:
        client = AsyncIOMotorClient(uri)
        # The is_master command is cheap and does not require auth.
        # But we want to test auth, so we'll ping.
        await client.admin.command('ping')
        print("✅ MongoDB Connection Successful!")
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
