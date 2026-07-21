from dotenv import load_dotenv
from pathlib import Path
import os

# Determine environment: defaults to "development" for local runs
ENV = os.getenv("ENV", "development")

# Load the appropriate .env file
env_file = ".env" if ENV == "production" else ".env_local"
env_path = Path(__file__).resolve().parent.parent / env_file

load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))