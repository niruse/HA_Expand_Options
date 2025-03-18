# SmartThings OAuth2 Integration for Home Assistant

## Overview
This Home Assistant integration enables seamless authentication with SmartThings using OAuth2. It allows for automatic token refresh, ensuring uninterrupted API access.

## Sample image
<img width="463" alt="image" src="https://github.com/user-attachments/assets/29b9e43a-c6b3-43fe-bf4f-1ac3cc56e136" />

## Features
- Secure OAuth2 authentication for SmartThings.
- Automatic refresh of access tokens.
- Home Assistant sensor to monitor authentication status.
- Easy configuration via Home Assistant UI.

## Installation

### Prerequisites
- Home Assistant installed and running.
- A SmartThings developer account.

### Manual Installation
1. Download or clone this repository:
   ```sh
   git clone https://github.com/your-repo/smartthings_oauth2.git
   ```
2. Copy the `smartthings_oauth2` folder to `config/custom_components/`.
3. Restart Home Assistant.
4. Go to **Settings** > **Devices & Services** > **Integrations**.
5. Click **Add Integration** and search for `SmartThings OAuth2`.
6. Follow the on-screen instructions to complete the setup.

## Configuration

### Step 1: Create a SmartThings OAuth Application
1. Install the **SmartThings CLI**:
   To install the SmartThings Command Line Interface (CLI), follow these steps based on your operating system:
   
   macOS: Use Homebrew by running the command: brew install smartthingscommunity/smartthings/smartthings.
   
   Windows: Download the smartthings.msi installer from the latest release
   from the link → https://github.com/SmartThingsCommunity/smartthings-cli/releases and run it. If a “Windows protected your PC” warning appears, click “More info” and then “Run anyway” to proceed with the installation.
   
   Linux and other systems: Download the appropriate zipped binary from the latest release, extract it, and install it on your system path. Ensure it is executable, though administrator privileges are not required.

3. Create a new OAuth app:
   ```sh
   smartthings apps:create
   ```
   - Set the redirect URI to: `https://httpbin.org/get`
   - Save the **OAuth Client ID** and **OAuth Client Secret**.

### Step 2: Generate an Authorization Code
Construct the following URL:
```url
https://api.smartthings.com/oauth/authorize?client_id=<your_client_id>&response_type=code&redirect_uri=https://httpbin.org/get&scope=r:devices:*+w:devices:*+x:devices:*
```
Paste it into your browser, log in, and authorize the app to get an authorization code.

### Step 3: Generate Access and Refresh Tokens
Use cURL to obtain tokens:
```sh
curl --location 'https://api.smartthings.com/oauth/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=authorization_code' \
--data-urlencode 'client_id=<your_client_id>' \
--data-urlencode 'client_secret=<your_client_secret>' \
--data-urlencode 'redirect_uri=https://httpbin.org/get' \
--data-urlencode 'code=<your_auth_code>'
```
Save the `access_token` and `refresh_token` from the response.

### Step 4: Configure Home Assistant
- In Home Assistant, enter the **OAuth Client ID**, **OAuth Client Secret**, and **Refresh Token**.
- The integration will handle token refreshes automatically.

## Usage
- The integration will automatically refresh the SmartThings access token.
- A sensor entity is available to track authentication status.

## API Usage
Use the access token to interact with the SmartThings API:
```sh
curl --location 'https://api.smartthings.com/v1/devices' \
--header 'Authorization: Bearer <your_access_token>'
```

## Support
For issues or feature requests, open a ticket in the [GitHub Issues](https://github.com/niruse/HA_Expand_Options/issues).

## Acknowledgments
Special thanks to [Shashank Mayya](https://levelup.gitconnected.com/smartthings-api-taming-the-oauth-2-0-beast-5d735ecc6b24) for the original guide that inspired this integration.

