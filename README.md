# Secrets

An API that allows you to share secrets with a Google authenticated user

## Getting started

    docker-compose up --build

This creates a NodeJS container, with NestJS installed and a DynamoDB container.

When the containers have started, create the DynamoDB table:

    docker exec -it secrets nodejs create-table.js

## Making Requests

Create a secret:

    curl -X POST http://localhost:3000/secrets -H 'Content-Type: application/json' -H 'Authorization: Bearer Password' -d '{"secret": "somevalue", "expires": 1575291600}'

    //returns
    {
        "uuid": "55fad2d4-c53e-4d63-a160-8fca02e6c86b",
        "key": "cf6b7cddc78ba9258fcf64dc92d097be86c96a88cc1e17234bc74311bacd0a0d",
        "url": "http://localhost:3000/secrets/55fad2d4-c53e-4d63-a160-8fca02e6c86b/cf6b7cddc78ba9258fcf64dc92d097be86c96a88cc1e17234bc74311bacd0a0d",
        "expires": 1574703562,
        "expiresISO": "2019-11-25T17:39:22.000Z"
    }


Getting the secret

    curl -X GET http://localhost:3000/secrets/55fad2d4-c53e-4d63-a160-8fca02e6c86b/cf6b7cddc78ba9258fcf64dc92d097be86c96a88cc1e17234bc74311bacd0a0d

    {
        "secret": "foovbar"
    }



    
## Notes

- Requests in NestJS follow middleware -> guard -> interceptor -> pipe -> controller -> interceptor -> exception filter
- Used a middleware for logging so we capture all requests (if we used an interceptor requests rejected by authentication middleware / authorization guard would not be logged). Subscribing to the response being sent allows us to include the status code and the request duration
- Registered a Authentication middleware AFTER the logger, so we capture all requests
- Authentication middleware makes use of `response.locals` to pass the authenticated user to later handlers
- Interceptor is not use, included for demonstration
- Two pipes are used for validation. A global one for validating customer reference in the path, and controller/method specific for the `POST` payload. The latter also *transforms* the request to make it case insensitive, and normalize to lowercase.
