import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

# Load environment variables from .env file
# First try to load from local directory, then fallback to root directory
if load_dotenv is not None:
    local_dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(local_dotenv_path):
        load_dotenv(local_dotenv_path)
        print(f"Loaded environment variables from: {local_dotenv_path}")
    else:
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        root_dotenv_path = os.path.join(root_dir, ".env")
        if os.path.exists(root_dotenv_path):
            load_dotenv(root_dotenv_path)
            print(f"Loaded environment variables from: {root_dotenv_path}")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./bd_logic_fallback.db"
)

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Enhanced connection testing with fallback
try:
    engine = create_engine(DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True, pool_size=5, max_overflow=10)
    # Test connection
    with engine.connect() as conn:
        print(f"Successfully connected to database: {DATABASE_URL}")
except Exception as e:
    print(f"Database connection failed: {e}")
    print("Falling back to SQLite database")
    DATABASE_URL = "sqlite:///./bd_logic_fallback.db"
    _connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=_connect_args)
    print(f"Using fallback database: {DATABASE_URL}")

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
    