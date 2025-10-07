import os, jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jwt import InvalidTokenError

JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

bearer = HTTPBearer(auto_error=True)

def get_current_user(credentials=Depends(bearer)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email") or payload.get("sub")
        if not email:
            raise ValueError("Token sin 'email'/'sub'")
        return {"email": email}
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")