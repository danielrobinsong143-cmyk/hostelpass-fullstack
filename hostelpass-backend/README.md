# HostelPass Backend

Spring Boot backend for the HostelPass Outpass Management System.
Architecture is frozen per `HostelPass_Software_Design_Document.md` — see that document before making structural changes.

## Prerequisites
- Java 17
- Maven 3.9+
- Docker (for local MySQL)

## Running Locally (dev profile)

1. Start the database:
   ```
   docker compose up -d
   ```
2. Run the app:
   ```
   mvn spring-boot:run
   ```
   This activates the `dev` profile by default, connecting to the MySQL container above.
   Flyway will automatically run `V1__init_schema.sql` against `hostelpass_dev` on first boot.

3. API will be available at `http://localhost:8080/api/v1`.

## Running in Production

Set the following environment variables, then run the Docker image:
- `SPRING_PROFILES_ACTIVE=prod`
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`

```
docker build -t hostelpass-backend .
docker run -p 8080:8080 --env-file .env hostelpass-backend
```

## Project Status
Phase 2 (Backend Project Setup) — complete. See project roadmap for subsequent phases (entities/repositories, authentication, business endpoints).
