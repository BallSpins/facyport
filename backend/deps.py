import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv(".env.development.local")

security = HTTPBearer()

ADMIN_SECRET_KEY = os.environ["ADMIN_SECRET_KEY"]

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> bool:
  """
  Memverifikasi token Bearer dari request header.
  """
  token = credentials.credentials
  if token != ADMIN_SECRET_KEY:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Akses ditolak: Token admin tidak valid atau tidak ditemukan.",
      headers={"WWW-Authenticate": "Bearer"},
    )
  return True
