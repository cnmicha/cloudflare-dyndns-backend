# Build your own Dynamic DNS with Cloudflare (backend)

Build your own dynamic DNS service. Supports IPv6 and IPv4. Available
as [Docker container](https://hub.docker.com/r/cnmicha/cloudflare-dyndns-backend).

## Description

Dynamic DNS is a method of automatically updating a DNS record in real time. This can be used for home internet
connections that change their IP address frequently.

As an alternative to services like No-IP, this requires owning a domain (available for a few cents per month) and
assigning the Cloudflare DNS servers to it.

Please note that using a NGINX or Apache reverse proxy for HTTPS is recommended as this application only provides an
HTTP server.

For client IP detection, the `x-real-ip` HTTP header is used (if present). Otherwise, there is a fallback to the layer 3
IP address.

## Installation with Docker (recommended for production)

You may use the following docker-compose file (reverse proxy for enabling HTTPS not included).

Please adapt the tag (`v1.1.1`) to the version you would like to use.

```yaml
version: "3.8"
services:

  backend:
    image: cnmicha/cloudflare-dyndns-backend:v1.1.1
    container_name: cloudflare-dyndns_backend
    environment:
      - DATABASE_URL=postgresql://postgres:mySecretDatabasePassword@10.0.0.3:5432/cloudflare-dyndns?schema=public&sslmode=prefer
    networks:
      cloudflare-dyndns_net:
        ipv4_address: 10.0.0.2
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:latest
    container_name: cloudflare-dyndns_postgres
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=mySecretDatabasePassword
    volumes:
      - postgres:/var/lib/postgresql/data
    networks:
      cloudflare-dyndns_net:
        ipv4_address: 10.0.0.3
    restart: unless-stopped

volumes:
  postgres:

networks:
  cloudflare-dyndns_net:
    driver: bridge
    enable_ipv6: false
    ipam:
      driver: default
      config:
        - subnet: 10.0.0.0/24
          gateway: 10.0.0.1
```

## Installation without Docker

### For production (reverse proxy for enabling HTTPS not included):

Make sure the environment variable `DATABASE_URL` is set.

```bash
# Install dependencies
$ npm ci --only=production

# Deploy database migrations and start the server
$ npm run start:prod
```

### For development:

Create a `.env` file and fill in the value for `DATABASE_URL`.

```bash
# Install dependencies
$ npm install

# Format the Prisma schema file
$ prisma format

# Push the database schema reflected in code to the database
$ prisma db push

# Create a migration from changes in the Prisma schema file
$ prisma migrate dev

# Reset the database to undo manual changes or changes from $ db push
$ prisma migrate reset

# Run the application
$ npm run start

# Run the application (watch mode with auto-reload)
$ npm run start:dev

# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Configuration

Currently, configuration of permitted domains needs to be done directly in the database. You may use tools like
PHPMyAdmin, if you like.

### Set up the DNS zone in Cloudflare

1. Add the domain (DNS zone) to Cloudflare.
2. Generate an [API key](https://dash.cloudflare.com/profile/api-tokens) in Cloudflare. Permissions for editing zone DNS
   are sufficient.
3. Open the database table `CloudflareDnsZone` and insert a new row. Fill in the attributes `name`(e.g. `example.com`)
   and `authToken` (the Cloudflare API key)

### Set up the DNS record in Cloudflare

1. Add the DNS record you would like to dynamically update by the client to Cloudflare. Typically, this will be a
   subdomain.
2. Open the database table `CloudflareDnsRecord` and insert a new row. Fill in the attributes `name` with the record
   name (e.g. `myhome.example.com`), `type`with the DNS record type (e.g. `A` for IPv4 or `AAAA` for IPv6). Insert
   the `id`of the `CloudflareDnsZone` for the attribute `cloudflareDnsZoneId`. For authentication of the clients, you
   need to generate an API key for them. Using a password generator is recommended. API Keys up to 64 characters are
   supported. Insert the API key for the attribute `authKey`.
3. Note the value of the `id` attribute that has been automatically generated. It will be needed for the client setup.

## Client setup

Each internet connection that should be attached to the system needs a client that makes periodic HTTPS requests. This
might be a DSL/cable/fiber router that has this functionality, a Raspberry Pi or an ordinary PC.

For updating the DNS record on IP address change, the client needs to call an HTTPS endpoint frequently. It is:
`PUT /record/{recordId}/updateIpAddress`. Replace `{recordId}` with the `id` from the database row, e.g `17`.

It is required to pass the HTTPS header `x-api-key`. Fill in the value of the `authKey` database attribute.

### Using curl with a cronjob (Linux or Windows)

You may use the `curl` command to do the HTTPS call. Please note that the CLI parameters (including the secret API key)
may be seen by other applications and users on your machine.

Set up a cronjob to run the following command every 1 minute:

```bash
# For IPv4:
$ curl -g -4 --location --request PUT 'https://dyndns.example.com/record/17/updateIpAddress' --header 'x-api-key: MySuperSecretApiKeyFromDatabase'

# For IPv6:
$ curl -g -6 --location --request PUT 'https://dyndns.example.com/record/17/updateIpAddress' --header 'x-api-key: MySuperSecretApiKeyFromDatabase'
```

Alternatively, there is an option to use GET requests (for compatibility with AVM FRITZ!Box home routers):

```bash
# For IPv4:
$ curl -g -4 --location 'https://dyndns.example.com/record/17/updateIpAddress?apiKey=MySuperSecretApiKeyFromDatabase'

# For IPv6:
$ curl -g -6 --location 'https://dyndns.example.com/record/17/updateIpAddress?apiKey=MySuperSecretApiKeyFromDatabase'
```

Please note that some transparent HTTPS proxys log URLs including the secret API key. Please ensure there is no proxy in
between before using GET requests.

## Setting both IPv4 and IPv6 records

If your internet connection is IPv4 and IPv6-enabled you might want to update an A and an AAAA DNS record. Therefore,
your server needs an IPv4 and IPv6 address at the same time.

If your client does not have a local IPv6 address, it is recommended to run the server on two different FQDNs, one with
only an A record and the other with an AAAA record.

## Developer information

This application provides a RESTful API on port 3000. It is based on the Nest.js framework with the Express web server
on Node.js. It uses the Prisma ORM and has been designed for PostgreSQL databases.

## Stay in touch

- Author - [cnmicha](https://github.com/cnmicha)

## License

This software is [MIT licensed](LICENSE).
