import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
connect_args = {}

# Handle SQLite vs PostgreSQL
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Ensure directory exists for sqlite file if specified
    sqlite_file = db_url.replace("sqlite:///", "")
    if sqlite_file and sqlite_file != ":memory:":
        parent_dir = os.path.dirname(os.path.abspath(sqlite_file))
        if parent_dir and not os.path.exists(parent_dir):
            try:
                os.makedirs(parent_dir, exist_ok=True)
            except Exception:
                pass
elif db_url.startswith("postgres://"):
    # Fix legacy postgres:// URL format for newer SQLAlchemy
    db_url = db_url.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(db_url, connect_args=connect_args)
except Exception as e:
    print(f"Warning: Failed to create engine with {db_url}: {e}. Falling back to SQLite.")
    engine = create_engine("sqlite:///./deviations.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
