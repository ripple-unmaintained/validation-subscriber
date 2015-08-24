#Validation Subscriber

Subscribes to rippled validations websocket subscription and forwards rippled

## Configuration

All configuration is done via environment variables according to the principles of the [Twelve Factor App](http://12factor.net/)

The following variables must be set:

- PEER_API_URL
- VALIDATOR_REGISTRY_API_URL
- VALIDATOR_REGISTRY_API_AUTH_USER
- VALIDATOR_REGISTRY_API_AUTH_PASS
