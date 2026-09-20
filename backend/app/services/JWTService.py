import jwt

def verify_jwt(jwkClient, auth_string: str | None):
    if not auth_string or not auth_string.lower().startswith("bearer "):
        return None

    token = auth_string[7:].strip()
    if not token:
        return None

    try:
        jwk = jwkClient.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, jwk.key, ["ES256"], audience="authenticated")
        return payload
    except Exception as e: 
        # invalid token 
        print(e)
        return None 