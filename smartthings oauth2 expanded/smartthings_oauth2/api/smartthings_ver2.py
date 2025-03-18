import requests
import base64

def refresh_smartthings_token(client_id, client_secret, refresh_token):
    url = "https://api.smartthings.com/oauth/token"

    # Proper Base64 Encoding
    credentials = f"{client_id}:{client_secret}".encode("utf-8")
    encoded_credentials = base64.b64encode(credentials).decode("utf-8")
    print(encoded_credentials)
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {encoded_credentials}',  # Use properly encoded value
    }

    data = {
        "grant_type": "refresh_token",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token
    }

    response = requests.post(url, headers=headers, data=data)

    print(response.text)
    return response.json()