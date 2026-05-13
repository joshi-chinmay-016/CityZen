from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.models.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import create_user, check_user, verify_password, get_user_by_id
from app.utils.jwt_handler import sign_jwt, decode_jwt

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = check_user(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = create_user(user)
    return UserResponse(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        created_at=new_user["created_at"]
    )

@router.post("/login")
async def login(user: UserLogin):
    db_user = check_user(user.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return sign_jwt(db_user["id"], db_user["email"])

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    token = authorization.split(" ")[1]
    decoded = decode_jwt(token)
    
    if not decoded:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    
    user = get_user_by_id(decoded["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )
