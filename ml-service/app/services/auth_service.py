import os
import json
import uuid
from datetime import datetime
from typing import Optional

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_PASSLIB = True
except ImportError:
    HAS_PASSLIB = False
    print("WARNING: passlib or bcrypt is not installed. Using fallback hashing.")
    import hashlib

DB_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if HAS_PASSLIB:
        return pwd_context.verify(plain_password, hashed_password)
    else:
        # Fallback hash verification
        import hashlib
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    if HAS_PASSLIB:
        return pwd_context.hash(password)
    else:
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

def get_db():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return {}

def save_db(db):
    with open(DB_FILE, "w") as f:
        json.dump(db, f, indent=4)

def check_user(email: str):
    db = get_db()
    for user_id, user_data in db.items():
        if user_data.get("email") == email:
            return user_data
    return None

def create_user(user):
    db = get_db()
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat()
    }
    
    db[user_id] = new_user
    save_db(db)
    return new_user

def get_user_by_id(user_id: str):
    db = get_db()
    return db.get(user_id)
