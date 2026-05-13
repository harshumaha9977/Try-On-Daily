import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# Database configuration
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "tryon_db")

# Automatically detect if we are on Cloud (PostgreSQL) or Local (MySQL)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and isinstance(DATABASE_URL, str):
    # Render provides 'postgres://', but SQLAlchemy requires 'postgresql+asyncpg://'
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    print("📡 Connected to Cloud PostgreSQL Database")
else:
    print("⚠️ DATABASE_URL not found or invalid. Falling back to Local MySQL.")
    # Fallback to Local MySQL
    DATABASE_URL = f"mysql+aiomysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    print("🏠 Connected to Local MySQL Database")

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

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
    status = Column(String(20), default="pending") # pending, processing, completed, failed
    result_url = Column(String(500), nullable=True)
    error_msg = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

async def init_db():
    try:
        async with engine.begin() as conn:
            # This creates the tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
            from sqlalchemy import text
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN last_checkin_date VARCHAR(20) DEFAULT NULL"))
            except Exception:
                pass # Column likely already exists
        print("✅ MySQL connected and tables initialized.")
    except Exception as e:
        print(f"❌ MySQL initialization error: {e}")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
