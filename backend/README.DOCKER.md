# Running MySQL locally with Docker (PowerShell)

This project uses MySQL for integration and development. If you don't have MySQL installed locally, you can run it via Docker.

## Start a MySQL container
PowerShell:

```powershell
# Pull image (only needed the first time)
docker pull mysql:8.0

# Run container (change passwords as needed)
$env:MYSQL_ROOT_PASSWORD='example'; $env:DB_NAME='restaurant_management'; docker run -d --name rms-mysql -e MYSQL_ROOT_PASSWORD=$env:MYSQL_ROOT_PASSWORD -e MYSQL_DATABASE=$env:DB_NAME -p 3306:3306 mysql:8.0 --default-authentication-plugin=mysql_native_password

# Verify container is running
docker ps --filter "name=rms-mysql"
```

## Initialize the database schema
Set your `.env` database variables (DB_HOST=localhost, DB_PORT=3306, DB_USER=root, DB_PASSWORD=example, DB_NAME=restaurant_management) and run:

```powershell
npm run db:init
```

## Run integration tests
```powershell
$env:RUN_INTEGRATION='true'; npm test --silent
```

## Stop and remove container
```powershell
npm run db:docker:down
```

Notes:
- The provided `db:docker:up` script in `package.json` uses default env vars; you can also pass them directly in PowerShell as shown above.
- After finishing, remove the container to free resources.
