from fastapi import APIRouter, HTTPException, status
from schemas.user import UserCreate, UserLogin
from services.auth import hash_password, verify_password
r = APIRouter()

@r.post("/register")
def register_user(user: UserCreate):
   
    hashed_password = hash_password(user.password)
    
    
    return {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password
    }
    
    @r.post("/login")
    def login_user(user: UserLogin):
    
     stored_hashed_password = "$2b$12$KIXQ1J5Z1F1J5Z1F1J5Z1O1J5Z1F1J5Z1F1J5Z1F1J5Z1F1J5Z"  # Example hashed password

    if verify_password(user.password, stored_hashed_password):
        return {"message": "Login successful"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = create_access_token(data={"sub": user.username,"role": "Learner"})
    return {"access_token": token, "token_type": "bearer"}
