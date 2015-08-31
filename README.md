#Validation Subscriber

Subscribes to rippled validations websocket subscription and forwards rippled

## Configuration

All configuration is done via environment variables according to the principles of the [Twelve Factor App](http://12factor.net/)

The following variables must be set:

- PEER_API_URL
- VALIDATOR_REGISTRY_API_URL
- VALIDATOR_REGISTRY_API_AUTH_USER
- VALIDATOR_REGISTRY_API_AUTH_PASS

# Local Development

To run the validation subscriber locally, you'll need:

* Docker (``apt-get install docker``)
* Docker-compose (``pip install docker-compose``)

To build the environment:

```
$ docker-compose build
```

To bring up the environment (be sure to have the environment variables set):

```
$ docker-compose up
```

You'll now have validation-subscriber running in docker.

Any modifications to the code will require a restart of the subscriber container.
Usually you can ^C and re-run ``docker-compose up subscriber``

If you need a shell:

```
$ docker-compose run subscriber /bin/bash
```

To run tests:

```
$ docker-compose run subscriber npm test
```

# Deployment

Check the README in the ansible/ directory
