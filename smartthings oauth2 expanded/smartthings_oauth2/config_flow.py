"""Config flow for SmartThings OAuth2."""
import voluptuous as vol
import json
import os
import logging
from homeassistant import config_entries
from .const import DOMAIN, CONF_OAUTH_CLIENT_ID, CONF_OAUTH_CLIENT_SECRET, CONF_SEED_REFRESH_TOKEN

TOKEN_FILE = "/config/smartthings_token.json"  # File path for storing OAuth credentials
_LOGGER = logging.getLogger(__name__)  # Home Assistant logger

class SmartThingsOAuth2ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for SmartThings OAuth2."""

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        # Load stored values if available
        stored_data = load_token_from_file()

        if user_input is not None:
            # Save the OAuth credentials to a file
            success = save_token_to_file(user_input)

            if success:
                _LOGGER.info("OAuth credentials saved successfully to %s", TOKEN_FILE)
            else:
                _LOGGER.error("Failed to save OAuth credentials to %s", TOKEN_FILE)

            return self.async_create_entry(title="SmartThings OAuth2", data=user_input)

        # Pre-fill form with stored data if available
        data_schema = vol.Schema({
            vol.Required(CONF_OAUTH_CLIENT_ID, default=stored_data.get(CONF_OAUTH_CLIENT_ID, "")): str,
            vol.Required(CONF_OAUTH_CLIENT_SECRET, default=stored_data.get(CONF_OAUTH_CLIENT_SECRET, "")): str,
            vol.Required(CONF_SEED_REFRESH_TOKEN, default=stored_data.get(CONF_SEED_REFRESH_TOKEN, "")): str,
        })

        return self.async_show_form(step_id="user", data_schema=data_schema, errors=errors)


### 🛠 Helper Functions
def load_token_from_file():
    """Load OAuth credentials from a file."""
    try:
        if os.path.exists(TOKEN_FILE):
            with open(TOKEN_FILE, "r") as f:
                _LOGGER.info("Loaded OAuth credentials from %s", TOKEN_FILE)
                return json.load(f)
    except Exception as e:
        _LOGGER.error("Error loading token file: %s", e)
    return {}  # Return an empty dictionary if the file doesn't exist or fails to load

def save_token_to_file(data):
    """Save OAuth credentials to a file."""
    try:
        with open(TOKEN_FILE, "w") as f:
            json.dump(data, f, indent=4)
        _LOGGER.info("Saved OAuth credentials to %s", TOKEN_FILE)
        return True
    except Exception as e:
        _LOGGER.error("Error saving token file: %s", e)
        return False
