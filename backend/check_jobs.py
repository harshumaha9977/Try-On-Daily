import asyncio
from database import AsyncSessionLocal, Job
from sqlalchemy import select

async def check_jobs():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Job).order_by(Job.created_at.desc()).limit(5))
        jobs = result.scalars().all()
        if not jobs:
            print("No jobs found in database.")
            return
        for job in jobs:
            print(f"ID: {job.id}, Status: {job.status}, Error: {job.error_msg}, Result: {job.result_url}")

if __name__ == "__main__":
    asyncio.run(check_jobs())
