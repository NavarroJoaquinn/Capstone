# auth-service/routers/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from passlib.context import CryptContext
import os, jwt

import db  # usamos db.users_col
from schemas import UserRegister, UserLogin, Token, MeOut

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Seguridad / JWT ---
JWT_SECRET = os.getenv("JWT_SECRET", "supersecreto-largo-aleatorio")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()  # para usar el botón Authorize de Swagger


# Helpers ----------------------------------------------------------------------
def create_access_token(sub: str, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """Crea un JWT con 'sub' (sujeto) y expiración."""
    now = datetime.utcnow()
    payload = {
        "sub": sub,                         # AQUÍ guardamos el email
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    """Valida el Bearer token y devuelve el usuario (sin password_hash)."""
    token = creds.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Token inválido: falta 'sub'")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

    # sub = email (consistente con register/login)
    user = await db.users_col.find_one({"email": sub}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    # Convertir _id a string para poder devolverlo como JSON
    user["_id"] = str(user["_id"])
    return user


# Endpoints --------------------------------------------------------------------
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    # Verificar si ya existe
    existing = await db.users_col.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generar hash seguro y guardar
    hashed_password = pwd.hash(user.password)

    doc = {
        "email": user.email,
        "password_hash": hashed_password,    # 👈 guardar como password_hash
        "company_name": user.company_name,
        "role": "owner",
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    await db.users_col.insert_one(doc)

    # Emitir token con sub = email
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    user = await db.users_col.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd.verify(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user["email"])
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=MeOut)
async def me(current_user = Depends(get_current_user)):
    # current_user viene de get_current_user (ya sin password_hash)
    # Mapeamos al esquema MeOut si prefieres:
    return MeOut(
        id=current_user["_id"],
        email=current_user["email"],
        company_name=current_user.get("company_name"),
        role=current_user.get("role"),
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at"),
    )


# Utilidad para limpiar usuarios de prueba (opcional)
@router.delete("/_clear_users", status_code=204)
async def clear_users():
    result = await db.users_col.delete_many({})
    # Si quieres, devuelve cuántos borraste:
    # return {"deleted": result.deleted_count}