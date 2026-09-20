from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas import UserCreate, UserLogin, UserResponse, AuthResponse, ApiResponse
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user
)

router = APIRouter()


@router.post("/register", response_model=ApiResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate JWT token
    token = create_access_token(data={"userId": str(new_user.id), "role": new_user.role})
    
    return ApiResponse(
        success=True,
        data={
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "role": new_user.role
            },
            "token": token
        }
    )


@router.post("/login", response_model=ApiResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate JWT token
    token = create_access_token(data={"userId": str(user.id), "role": user.role})
    
    return ApiResponse(
        success=True,
        data={
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role
            },
            "token": token
        }
    )


@router.get("/me", response_model=ApiResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return ApiResponse(
        success=True,
        data={
            "id": str(current_user.id),
            "email": current_user.email,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat()
        }
    )
