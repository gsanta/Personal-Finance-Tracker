# Personal finance tracker

## How to run the application

This project uses Docker Compose to set up all required services (backend, frontend, and database).

1. Make sure Docker is installed and running on your machine.
2. In the project root directory, run:

   ```sh
   docker compose up
   ```

This will start all services defined in `docker-compose.yml`.

3. open the application on http://localhost:3012/payments

- The backend (Spring Boot) will be available on port 3012.
- The frontend will be started on port 3013.
- The database (Postgres) will be started and seeded as defined. It uses 6501.

## Development

- Backend: Java 21, Spring Boot 3.5.5, Maven
- Frontend: React, Node.js, Webpack

## Running backend and frontend locally

### Backend (Spring Boot)

1. Make sure Postgres is running (docker compose up postgres).
2. In the project root, run:

   ```sh
   ./mvnw clean package -Dspring.profiles.active=test
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

### Frontend (React)

1. In the `root` directory, install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

## Running tests

To run backend tests:

> **Note:** The Postgres database must be running before you execute the tests. You can start it with Docker Compose:

```sh
docker compose up postgres
```

Then run:

```sh
./mvnw test
```

## Notes

- The application uses environment-specific configuration for service URLs and database connections.
- Seed data and migrations are managed via Flyway and SQL scripts.
- For more details, see the source code and configuration files.
