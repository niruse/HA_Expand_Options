"""Sensor for SmartThings OAuth2 Integration."""
import asyncio
import json
import os
from homeassistant.components.sensor import SensorEntity
from homeassistant.const import CONF_NAME
from .api.smartthings_ver2 import refresh_smartthings_token  # Import function
from .const import DOMAIN

TOKEN_FILE = "/config/smartthings_oauth.json"  # Path to store the refresh token

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up the SmartThings sensor from a config entry."""
    client_id = entry.data.get("oauth_client_id")
    client_secret = entry.data.get("oauth_client_secret")

    # Read refresh token from file if it exists
    refresh_token = read_refresh_token_from_file()
    if not refresh_token:
        refresh_token = entry.data.get("seed_oauth_refresh_token")
        
    sensor = SmartThingsSensor(client_id, client_secret, refresh_token)
    async_add_entities([sensor], True)

def read_refresh_token_from_file():
    """Read the refresh token from a file if it exists."""
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("seed_oauth_refresh_token")
        except (json.JSONDecodeError, IOError):
            return None
    return None

def write_to_file(key_name, refresh_token):
    """Write the refresh token to a file."""
    try:
        with open(TOKEN_FILE, "w", encoding="utf-8") as f:
            json.dump({key_name: refresh_token}, f, indent=4)
        print(f"Successfully wrote {key_name} to {TOKEN_FILE}")  # Debug log
    except IOError as e:
        print(f"Error: Could not write to {TOKEN_FILE} - {e}")  # Log error


class SmartThingsSensor(SensorEntity):
    """Representation of a SmartThings sensor."""

    def __init__(self, client_id, client_secret, refresh_token):
        """Initialize the sensor."""
        self._state = None
        self._status = "Not Registered"  # Initialize _status
        self._client_id = client_id
        self._client_secret = client_secret
        self._refresh_token = refresh_token
        self.counter = 0

    @property
    def name(self):
        """Return the name of the sensor."""
        return "SmartThings Sensor"

    @property
    def extra_state_attributes(self):
        """Return additional attributes."""
        return {
            "סטאטוס הרשמה": self._status
        }

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    async def async_update(self):          
        """Fetch new data from the SmartThings API."""
        self._state = "Running"
        # Read the latest refresh token from the file
        latest_refresh_token = read_refresh_token_from_file()
        if latest_refresh_token:
            self._refresh_token = latest_refresh_token  # Update the refresh token before making API call

        # Run the sync function in an executor to prevent blocking
        token_data = await asyncio.get_running_loop().run_in_executor(
            None,
            refresh_smartthings_token,
            self._client_id,
            self._client_secret,
            self._refresh_token
        )

        # Extract the new refresh token if available
        if isinstance(token_data, dict) and "refresh_token" in token_data:
            self._refresh_token = token_data["refresh_token"]
            key_name = "seed_oauth_refresh_token"
            write_to_file(key_name, self._refresh_token)
            key_name = "access_token"
            write_to_file(key_name, self._refresh_token)
            key_name = "token_type"
            write_to_file(key_name, self._refresh_token)
            key_name = "refresh_token"
            write_to_file(key_name, self._refresh_token)
            key_name = "expires_in"
            write_to_file(key_name, self._refresh_token)
            key_name = "scope"
            write_to_file(key_name, self._refresh_token)
            key_name = "access_tier"
            write_to_file(key_name, self._refresh_token)
            key_name = "installed_app_id"
            write_to_file(key_name, self._refresh_token)


        self._status = token_data
        await asyncio.sleep(10)






