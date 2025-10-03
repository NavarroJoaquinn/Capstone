import os, jwt
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.getenv("JWT_SECRET", "supersecreto-largo-aleatorio")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Habilita el botón Authorize en Swagger
security = HTTPBearer(auto_error=False)

def extract_token(
    creds: HTTPAuthorizationCredentials | None = Depends(security),   # Opción C (Authorize)
    authorization: str | None = Header(None, alias="Authorization"),  # Opción B (header manual)
) -> str:
    token = None
    if creds and creds.scheme.lower() == "bearer":
        token = creds.credentials
    elif authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta Authorization: Bearer <token>",
        )
    return token

def get_current_user(token: str = Depends(extract_token)) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if "sub" not in payload:
            raise ValueError("Token sin 'sub'")
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")