from pydantic import BaseModel, EmailStr
from typing import Optional

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    avatar: Optional[str] = None
    is_active: bool = True
    created_at: str

class UserUpdateRoleRequest(BaseModel):
    role: str
    is_active: bool
