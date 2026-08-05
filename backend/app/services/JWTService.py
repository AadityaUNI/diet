import jwt

def verify_jwt(jwkClient, auth_string: str):
    token = auth_string[6:].strip()
    try:
        jwk = jwkClient.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, jwk.key, ["ES256"], audience="authenticated")
        return payload
    except Exception as e: 
        # invalid token 
        print(e)
        return None 