import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# =============================================
# DATABASE CONFIG — PostgreSQL (Supabase/Railway)
# =============================================
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    raise RuntimeError("❌ DATABASE_URL is not set! Please add it to your Railway environment variables.")

# Fix URL prefix — SQLAlchemy needs 'postgresql+asyncpg://' format
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

print("📡 Connecting to Cloud PostgreSQL (Supabase)...")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set True only for debugging
    connect_args={
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0
    }
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# =============================================
# MODELS
# =============================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    credits = Column(Integer, default=10)
    last_checkin_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    result_url = Column(String(500), nullable=True)
    error_msg = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


# =============================================
# DB INIT & SESSION
# =============================================

async def init_db():
    max_retries = 5
    retry_delay = 5
    for attempt in range(max_retries):
        try:
            print(f"📡 [DB] Attempting connection (Attempt {attempt+1}/{max_retries})...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                # Add last_checkin_date column if missing (safe migration)
                from sqlalchemy import text
                try:
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_checkin_date VARCHAR(20) DEFAULT NULL"))
                except Exception:
                    pass
            print("✅ [DB] Database connected and tables ready.")
            return # Success!
        except Exception as e:
            print(f"⚠️ [DB] Connection attempt {attempt+1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"⏳ [DB] Retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
            else:
                print("❌ [DB] All retries failed. Application might struggle.")
                # We don't raise here to keep the healthcheck alive


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
