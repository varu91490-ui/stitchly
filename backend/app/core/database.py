import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# If Oracle is used, initialize client in thick mode if needed for local XE connection
if settings.DATABASE_URL.startswith("oracle"):
    try:
        import oracledb
        if os.path.exists(settings.ORACLE_LIB_DIR):
            oracledb.init_oracle_client(lib_dir=settings.ORACLE_LIB_DIR)
        else:
            oracledb.init_oracle_client()
    except Exception as e:
        # Client may already be initialized or running in thin mode
        pass

engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif settings.DATABASE_URL.startswith("mysql"):
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 3600
elif settings.DATABASE_URL.startswith("oracle"):
    engine_kwargs["pool_pre_ping"] = True

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
