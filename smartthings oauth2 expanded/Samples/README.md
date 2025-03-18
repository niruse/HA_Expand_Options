# SmartThings Device Monitoring for Home Assistant

## Overview
This guide provides a sample configuration for integrating Samsung SmartThings appliances (Cooler and Freezer) with Home Assistant using RESTful sensors and binary sensors.

## Features
- Periodic status retrieval from SmartThings API.
- Monitoring of cooler and freezer temperatures.
- Tracking set temperatures for cooler and freezer.
- Detection of door open/close state for cooler and freezer.

## Fetching Device List
To retrieve a list of available devices, use the following API request in Postman or any API client:
```sh
GET https://api.smartthings.com/v1/devices/
Authorization: Bearer <your_access_token>
```
This will return a list of devices along with their IDs, which can be used in the configuration below.

## Configuration
Add the following YAML configuration to your Home Assistant `configuration.yaml` file:

```yaml
scan_interval: 120
resource: https://api.smartthings.com/v1/devices/{{device_id}}/status
headers:
  Authorization: "Bearer {{ states('sensor.smartthings_sensor') | default('MISSING_TOKEN') }}"

sensor:
  - name: "Samsung Cooler Temperature"
    value_template: "{{ value_json.components.cooler.temperatureMeasurement.temperature.value }}"
    unit_of_measurement: "°C"
    icon: "mdi-thermometer"
    device_class: temperature

  - name: "Samsung Cooler Set Temperature"
    value_template: "{{ value_json.components.cooler.thermostatCoolingSetpoint.coolingSetpoint.value }}"
    unit_of_measurement: "°C"
    icon: "mdi-thermometer"
    device_class: temperature

binary_sensor:
  - name: "Samsung Cooler Door"
    value_template: "{{ value_json.components.cooler.contactSensor.contact.value }}"
    device_class: opening

  - name: "Samsung Freezer Door"
    value_template: "{{ value_json.components.freezer.contactSensor.contact.value }}"
    device_class: opening
```

## How It Works
- The configuration uses Home Assistant's REST sensor integration to fetch status updates every **120 seconds** from SmartThings.
- **Bearer token authentication** is used via the `Authorization` header.
- The **sensor values** are extracted from the SmartThings API response.
- **Binary sensors** track whether the cooler and freezer doors are open or closed.

## Usage
1. Ensure your SmartThings API token is available as `sensor.smartthings_sensor`.
2. Retrieve your SmartThings device ID using the API request above.
3. Replace `{{device_id}}` in the YAML configuration with your actual device ID.
4. Restart Home Assistant after adding the configuration.
5. The temperature and door status values will be available in Home Assistant under the configured sensor and binary sensor entities.

## Troubleshooting
- If the sensors are not updating, check that `sensor.smartthings_sensor` contains a valid token.
- Ensure your SmartThings API key has the correct permissions.
- Check Home Assistant logs for API errors.

## Additional Customization
If your Samsung SmartThings appliance has additional sensors, you can modify the configuration by adding more sensors under `sensor:` or `binary_sensor:` using the correct JSON path.
