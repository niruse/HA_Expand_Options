"""Sensor for SmartThings OAuth2 Integration."""
import asyncio
from homeassistant.components.sensor import SensorEntity
from homeassistant.const import CONF_NAME
from .api.smartthings_ver2 import refresh_smartthings_token  # Import function
from .const import DOMAIN

async def async_setup_entry(hass, entry, async_add_entities):
    """Set up the SmartThings sensor from a config entry."""
    client_id = entry.data.get("oauth_client_id")
    client_secret = entry.data.get("oauth_client_secret")
    refresh_token = entry.data.get("seed_oauth_refresh_token")

    sensor = SmartThingsSensor(client_id, client_secret, refresh_token)
    async_add_entities([sensor], True)


class SmartThingsSensor(SensorEntity):
    """Representation of a SmartThings sensor."""

    def __init__(self, client_id, client_secret, refresh_token):
        """Initialize the sensor."""
        self._state = None
        self._status = "Not Registered"  # Initialize _status
        self._client_id = client_id
        self._client_secret = client_secret
        self._refresh_token = refresh_token

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
        self._state = "test"

        # Run the sync function in an executor to prevent blocking
        token_data = await asyncio.get_running_loop().run_in_executor(
            None,
            refresh_smartthings_token,
            self._client_id,
            self._client_secret,
            self._refresh_token
        )

        # Extract the token or set an error state
        self._status = token_data
