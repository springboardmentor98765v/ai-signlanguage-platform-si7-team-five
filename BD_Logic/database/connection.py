import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if load_dotenv is not None:
    dotenv_path = os.path.join(root_dir, ".env")
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:VinayBellamkonda@db.ovvvcudvagbnlojfmmnx.supabase.co:5432/postgres"
)

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
try:
    engine = create_engine(DATABASE_URL, connect_args=_connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"Database connection failed: {e}")
    print("Falling back to SQLite database")
    DATABASE_URL = "sqlite:///./bd_logic_fallback.db"
    _connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=_connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
    