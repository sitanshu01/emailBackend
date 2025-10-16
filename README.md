# Backend API

This is the backend API for the FullStack Web Development project. It handles user authentication, form management, and data storage.

## Technologies Used

- **Runtime:** [Bun](https://bun.sh/)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Caching/Message Broker:** [Redis](https://redis.io/)

## Setup and Running Locally

1. **Navigate to the backend directory:**

   ```bash
   cd emailBackend
   ```

2. **Create a `.env` file:**
   Copy the `.env.example` file to `.env` and fill in the required environment variables. The `docker-compose.yml` is configured to use hardcoded values for PostgreSQL for local development, but you still need to provide values for:

   ```
   REDIS_URL = "redis://redis:6379" # This will connect to the redis service in docker-compose
   ACCESS_TOKEN_SECRET = "your_access_token_secret"
   REFRESH_JWT_SECRET = "your_refresh_jwt_secret"
   RESEND_API_KEY = "your_resend_api_key"
   ```

3. **Build and Run with Docker Compose:**
   From within the `emailBackend` directory, run the following command to build the Docker images and start the services (PostgreSQL, Redis, and the backend API):

   ```bash
   docker-compose up --build -d
   ```

   The `-d` flag runs the services in detached mode.

4. **Run Prisma Migrations:**
   After the services are up and running, you need to apply the database migrations.

   ```bash
   docker-compose exec backend bunx prisma migrate deploy
   ```

5. **Seed the Database:**
   Populate the database with initial data (e.g., default roles).

   ```bash
   docker-compose exec backend bun prisma/seed.ts
   ```

6. **Access the Backend API:**
   The backend API will be running on `http://localhost:3000`.

## Stopping the Services

To stop the backend services, navigate to the `emailBackend` directory and run:

```bash
docker-compose down
```

This will stop and remove the containers, networks, and volumes created by `up`.
