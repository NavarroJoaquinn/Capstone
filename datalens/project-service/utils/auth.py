from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "supersecreto-largo-aleatorio")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

bearer_scheme = HTTPBearer()

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = creds.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # payload esperado: {"sub": email, ...}
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")