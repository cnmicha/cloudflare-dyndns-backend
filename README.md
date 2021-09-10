# Build your own Dynamic DNS with Cloudflare (backend)

Build your own dynamic DNS service. Supports IPv6 and IPv4. Available
as [Docker container](https://hub.docker.com/r/cnmicha/cloudflare-dyndns-backend).

## Description

Dynamic DNS is a method of automatically updating a DNS record in real time. This can be used for home internet
connections that change their IP address frequently.

## Installation with Docker (recommended for production)

(Coming soon)

## Installation without Docker

For production:

```bash
# Install dependencies
$ npm ci --only=production

# Run the application
$ npm run start:prod
```

For development:

```bash
# Install dependencies
$ npm install

# Run the application
$ npm run start

# Run the application (watch mode with auto-reload)
$ npm run start:dev
```

Run the tests:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Developer information

This application provides a RESTful API. It is based on the Nest.js framework with the Express web server on Node.js. It
uses the Prisma ORM and has been designed for PostgreSQL databases.

## Stay in touch

- Author - [cnmicha](https://github.com/cnmicha)

## License

This software is [MIT licensed](LICENSE).
