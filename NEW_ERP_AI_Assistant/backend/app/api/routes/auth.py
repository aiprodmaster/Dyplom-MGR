"""
API Router dla uwierzytelniania i autoryzacji
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from ...services.database_service import DatabaseService
from ...dependencies import get_db_service
from ...config.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class UserLogin(BaseModel):
    """Model logowania użytkownika"""
    username: str
    password: str

class UserRegister(BaseModel):
    """Model rejestracji użytkownika"""
    username: str
    email: str
    full_name: str
    password: str
    role: str = "user"

class TokenResponse(BaseModel):
    """Model odpowiedzi z tokenem"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: Dict[str, Any]

class UserInfo(BaseModel):
    """Model informacji o użytkowniku"""
    id: int
    username: str
    email: str
    full_name: str
    role: str
    created_at: str
    last_login: Optional[str]
    is_active: bool

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Weryfikacja hasła"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashowanie hasła"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Tworzenie tokenu dostępu"""
    settings = get_settings()
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Tworzenie tokenu odświeżania"""
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db_service: DatabaseService = Depends(get_db_service)
):
    """Dependency do pobierania aktualnego użytkownika z tokenu"""
    settings = get_settings()
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # TODO: Pobieranie użytkownika z bazy danych
    # W rzeczywistej aplikacji tutaj byłoby zapytanie do bazy
    
    # Przykładowy użytkownik dla demo
    user = {
        "id": 1,
        "username": username,
        "email": f"{username}@example.com",
        "full_name": "Demo User",
        "role": "user",
        "is_active": True
    }
    
    return user

@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint logowania użytkownika
    """
    try:
        logger.info(f"🔐 Próba logowania użytkownika: {user_data.username}")
        
        # TODO: Weryfikacja użytkownika w bazie danych
        # W rzeczywistej aplikacji sprawdzalibyśmy dane w bazie
        
        # Demo logika - akceptujemy admin/admin i user/user
        if user_data.username == "admin" and user_data.password == "admin":
            user_info = {
                "id": 1,
                "username": "admin",
                "email": "admin@erp-assistant.com",
                "full_name": "Administrator",
                "role": "admin",
                "is_active": True
            }
        elif user_data.username == "user" and user_data.password == "user":
            user_info = {
                "id": 2,
                "username": "user",
                "email": "user@erp-assistant.com",
                "full_name": "Demo User",
                "role": "user",
                "is_active": True
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nieprawidłowa nazwa użytkownika lub hasło"
            )
        
        # Tworzenie tokenów
        settings = get_settings()
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_info["username"]}, 
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": user_info["username"]})
        
        logger.info(f"✅ Użytkownik {user_data.username} zalogowany pomyślnie")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_info=user_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Błąd logowania: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas logowania: {str(e)}"
        )

@router.post("/register", response_model=Dict[str, Any])
async def register(
    user_data: UserRegister,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint rejestracji nowego użytkownika
    """
    try:
        logger.info(f"📝 Rejestracja nowego użytkownika: {user_data.username}")
        
        # TODO: Sprawdzenie czy użytkownik już istnieje
        # TODO: Zapisanie użytkownika w bazie danych
        
        # Demo response
        return {
            "success": True,
            "message": "Użytkownik zarejestrowany pomyślnie",
            "username": user_data.username,
            "email": user_data.email
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd rejestracji: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas rejestracji: {str(e)}"
        )

@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint odświeżania tokenu dostępu
    """
    try:
        settings = get_settings()
        
        # Dekodowanie refresh token
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if username is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Tworzenie nowego access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    except Exception as e:
        logger.error(f"❌ Błąd odświeżania tokenu: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas odświeżania tokenu: {str(e)}"
        )

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint pobierania informacji o aktualnym użytkowniku
    """
    try:
        logger.info(f"👤 Pobieranie informacji o użytkowniku: {current_user['username']}")
        
        user_info = UserInfo(
            id=current_user["id"],
            username=current_user["username"],
            email=current_user["email"],
            full_name=current_user["full_name"],
            role=current_user["role"],
            created_at=datetime.now().isoformat(),
            last_login=datetime.now().isoformat(),
            is_active=current_user["is_active"]
        )
        
        return user_info
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania informacji o użytkowniku: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas pobierania informacji o użytkowniku: {str(e)}"
        )

@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint wylogowania użytkownika
    """
    try:
        logger.info(f"🚪 Wylogowanie użytkownika: {current_user['username']}")
        
        # TODO: Dodanie tokenu do blacklisty
        # W rzeczywistej aplikacji tokeny powinny być dodane do blacklisty
        
        return {
            "success": True,
            "message": "Użytkownik wylogowany pomyślnie"
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd wylogowania: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas wylogowania: {str(e)}"
        )

@router.get("/users")
async def list_users(
    current_user: dict = Depends(get_current_user),
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint pobierania listy użytkowników (tylko dla adminów)
    """
    try:
        # Sprawdzenie uprawnień
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak uprawnień do tej operacji"
            )
        
        logger.info("👥 Pobieranie listy użytkowników")
        
        # TODO: Pobieranie użytkowników z bazy danych
        
        # Demo data
        users = [
            {
                "id": 1,
                "username": "admin",
                "email": "admin@erp-assistant.com",
                "full_name": "Administrator",
                "role": "admin",
                "is_active": True,
                "created_at": datetime.now().isoformat()
            },
            {
                "id": 2,
                "username": "consultant1",
                "email": "consultant@example.com",
                "full_name": "Jan Kowalski",
                "role": "consultant",
                "is_active": True,
                "created_at": datetime.now().isoformat()
            }
        ]
        
        return {
            "users": users,
            "count": len(users)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Błąd pobierania listy użytkowników: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas pobierania listy użytkowników: {str(e)}"
        )

@router.get("/check-permissions")
async def check_permissions(
    resource: str,
    action: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint sprawdzania uprawnień użytkownika
    """
    try:
        logger.info(f"🔒 Sprawdzanie uprawnień użytkownika {current_user['username']} dla {resource}:{action}")
        
        # Uproszczona logika uprawnień
        permissions = {
            "admin": ["all"],
            "consultant": ["chat", "documents", "analytics"],
            "user": ["chat"]
        }
        
        user_role = current_user.get("role", "user")
        user_permissions = permissions.get(user_role, [])
        
        has_permission = "all" in user_permissions or resource in user_permissions
        
        return {
            "user_id": current_user["id"],
            "username": current_user["username"],
            "role": user_role,
            "resource": resource,
            "action": action,
            "has_permission": has_permission,
            "permissions": user_permissions
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd sprawdzania uprawnień: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas sprawdzania uprawnień: {str(e)}"
        )
