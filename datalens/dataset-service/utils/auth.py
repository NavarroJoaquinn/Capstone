import os
import jwt
from fastapi import HTTPException, status
from typing import TypedDict, Optional

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
ALGO = "HS256"

class TokenUser(TypedDict, total=False):
    sub: str  # email
    exp: int

def get_current_user(token: str) -> TokenUser:
    """Decodifica token 'Bearer ...' y retorna claims. Lanza 401 si es inválido."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGO])
        if "sub" not in payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido (sin sub)")
        return payload  # {'sub': email, 'exp': ...}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")