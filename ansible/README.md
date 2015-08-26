# validation-subscriber deployment

There are two deployment environments, staging and production. Both
environments are composed of:

- One EC2 instance, with Name=api-{environment}.validators.ripple.com

Deployment happens automatically via circleci:

1. A pull request is made against the 'staging' branch
2. The request is merged, triggering a circleci build
3. Circleci runs tests via docker-compose
4. After tests pass, the built docker image is pushed to quay.io as
   validationsubscriber_subscriber:{environment}
5. ansible-playbook is ran against site.yml which updates docker, and stands up
   the needed containers

## Docker containers

There is docker containers in use:

- validationsubscriber_subscriber - validation-subscriber
