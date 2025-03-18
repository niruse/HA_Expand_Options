"""SmartThings OAuth2 Integration for Home Assistant."""
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN

from .const import DOMAIN

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up SmartThings OAuth2 from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Add the sensor setup to the entry setup
    hass.async_create_task(
        hass.config_entries.async_forward_entry_setups(entry, [SENSOR_DOMAIN])
    )
    return True
