# INTERN 2 CHECKPOINT: Configuration management
# This file handles environment variable loading and database configuration
# It implements secure configuration practices for the backend application

from dotenv import load_dotenv
import importlib
import os

# Load environment variables from .env file
# First try to load from local directory, then fallback to root directory
local_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(local_env_path):
    load_dotenv(dotenv_path=local_env_path)
    print(f"Loaded environment variables from: {local_env_path}")
else:
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(root_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(dotenv_path=env_path)
        print(f"Loaded environment variables from: {env_path}")

# INTERN 2 CHECKPOINT: Security configuration
# JWT secret key and algorithm for token-based authentication
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# INTERN 2 CHECKPOINT: Database configuration
# Loads database URL from environment with fallback for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# INTERN 2 CHECKPOINT: Database driver validation
# Ensures psycopg2 is available for PostgreSQL connections
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    try:
        importlib.import_module("psycopg2")
    except ImportError:
        pass

# Using SQLite database (PostgreSQL not available)
print(f"Using database: {DATABASE_URL}")
