import os
from cryptography.fernet import Fernet

fernet = Fernet(os.getenv("FERNET_SECRET_KEY").encode())

def encrypt_token(token: str):
    return fernet.encrypt(token.encode()).decode()

def decrypt_token(token: str):
    return fernet.decrypt(token.encode()).decode()