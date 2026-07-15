# Backend — Bus Student Management API

Node.js + Express + PostgreSQL REST API for managing bus students.
There is a single user role (admin) - can perform full CRUD on bus students.

## Tech stack

- Node.js + Express
- PostgreSQL (via `pg`)
- JWT auth (`jsonwebtoken`) + `bcryptjs` password hashing
- No ORM — plain parameterized SQL queries

## Project structure

```
backend/
  schema.sql
  .env.example
  src/
    server.js
    db.js
    middleware/
      auth.js
      errorHandler.js
    routes/
      auth.routes.js
      student.routes.js
    controllers/
      auth.controller.js
      student.controller.js
    scripts/
      seedAdmin.js
```

## Setup

1. Install dependencies
2. Create the database
3. Configure environment variables
4. Seed the admin user (creates the one and only login for this system):

   ```bash
   npm run seed
   ```

5. Run the server

---

The API (and the static frontend, served by the same Express app) will be
available at `http://localhost:5000` by default.

---

## Notes on the single-role design

There is intentionally no "register" endpoint — this system is meant for one
admin/staff account that performs all student CRUD. To rotate credentials or
create the account on a fresh database, edit `.env` and re-run `npm run seed`.
