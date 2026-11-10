from typing import Optional
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_default_owner(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(
            name="ಟೈಲರಿಂಗ್ ಖಾತೆದಾರರು",
            username="shop_owner",
            password_hash="single_user_mode"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if token:
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            try:
                user = db.query(User).filter(User.id == int(payload["sub"])).first()
                if user:
                    return user
            except Exception:
                pass
    # In single-user mode, automatically use the shop owner account
    return get_default_owner(db)
