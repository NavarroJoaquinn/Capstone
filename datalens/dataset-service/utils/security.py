from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status
from utils.auth import get_current_user  # tu verificador de JWT

# Declara el esquema Bearer -> esto hace que Swagger muestre "Authorize"
bearer_scheme = HTTPBearer(auto_error=True)

def current_user_creds(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Devuelve el payload decodificado del JWT (o lanza 401).
    """
    token = creds.credentials  # el string del JWT
    try:
        return get_current_user(token)  # tu función que decodifica y valida el JWT
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {e}",
        )