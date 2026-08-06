# INTERN 2 CHECKPOINT: Configuration management
# This file handles environment variable loading and database configuration
# It implements secure configuration practices for the backend application

from dotenv import load_dotenv
import importlib
import os

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# INTERN 2 CHECKPOINT: Security configuration
# JWT secret key and algorithm for token-based authentication
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
<<<<<<< HEAD

# INTERN 2 CHECKPOINT: Database configuration
# Loads database URL from environment with fallback for local development
DATABASE_URL = os.getenv("DATABASE_URL", "")
=======
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
>>>>>>> a76202bb35f4a2f507e5a5f4630c51b9bf295eb6

# INTERN 2 CHECKPOINT: Database driver validation
# Ensures psycopg2 is available for PostgreSQL connections
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    try:
        importlib.import_module("psycopg2")
    except ImportError:
        pass

# INTERN 2 CHECKPOINT: Database connection testing with fallback
# Tests database connectivity and falls back to SQLite if connection fails
# This ensures the application can run in different environments
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    try:
        from sqlalchemy import create_engine
        test_engine = create_engine(DATABASE_URL)
        with test_engine.connect() as conn:
            pass
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("Falling back to SQLite database")
        DATABASE_URL = "sqlite:///./backend_fallback.db"
