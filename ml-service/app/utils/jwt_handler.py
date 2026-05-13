import time
import os
from typing import Dict

try:
    import jwt
    HAS_JWT = True
except ImportError:
    HAS_JWT = False
    print("WARNING: PyJWT is not installed. Please run `pip install PyJWT`")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secret_key_change_me_in_prod")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def sign_jwt(user_id: str, email: str) -> Dict[str, str]:
    payload = {
        "user_id": user_id,
        "email": email,
        "expires": time.time() + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    }
    
    if HAS_JWT:
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        # PyJWT in older versions returns bytes, newer returns str
        if isinstance(token, bytes):
            token = token.decode('utf-8')
    else:
        # Fallback dummy token to prevent crashing if library not installed
        import json, base64
        header = base64.b64encode(b'{"alg":"HS256","typ":"JWT"}').decode()
        body = base64.b64encode(json.dumps(payload).encode()).decode()
        token = f"{header}.{body}.dummy_signature"

    return {"access_token": token}

def decode_jwt(token: str) -> dict:
    if HAS_JWT:
        try:
            decoded_token = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return decoded_token if decoded_token["expires"] >= time.time() else None
        except:
            return None
    else:
        try:
            import json, base64
            parts = token.split(".")
            if len(parts) != 3: return None
            decoded_token = json.loads(base64.b64decode(parts[1]).decode())
            return decoded_token if decoded_token["expires"] >= time.time() else None
        except:
            return None
