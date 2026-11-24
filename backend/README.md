# Roxiler Systems - Store Rating Platform Backend

Production-ready backend built for the Roxiler Systems Internship Coding Challenge using **Node.js**, **Express.js**, **PostgreSQL (`pg`)**, **JWT authentication**, and **bcrypt**.

---

## 🏗️ Architecture & Technology Stack

- **Runtime & Framework:** Node.js (v18+), Express.js (v5)
- **Database:** PostgreSQL (with normalized tables, check constraints, foreign keys, and indexes)
- **Database Client:** `pg` (Node-Postgres connection pool with parameterized queries)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing:** `bcrypt` (10 salt rounds)
- **Design Pattern:** MVC with decoupled Services layer (Separation of Concerns)

```
backend/
├── app.js                         # Express application setup, middlewares, root route
├── server.js                      # Server bootstrap, PostgreSQL pool lifecycle
├── package.json                   # Dependencies and npm scripts
├── postman_collection.json        # Importable Postman API collection
├── .env.example                   # Template environment variables
├── .env                           # Local environment configuration
└── src/
    ├── config/
    │   ├── db.js                  # pg.Pool configuration and query wrapper
    │   └── schema.sql             # Normalized PostgreSQL DDL schema & triggers
    ├── controllers/
    │   ├── authController.js      # Auth request handlers
    │   ├── adminController.js     # Admin request handlers
    │   ├── userController.js      # Normal User request handlers
    │   └── storeOwnerController.js# Store Owner request handlers
    ├── middleware/
    │   ├── authMiddleware.js      # JWT authentication and RBAC authorization
    │   └── errorMiddleware.js     # Centralized error and 404 handler
    ├── routes/
    │   ├── index.js               # Central route aggregator & health check
    │   ├── authRoutes.js          # /api/auth routes
    │   ├── adminRoutes.js         # /api/admin routes
    │   ├── userRoutes.js          # /api/user routes (and aliases /stores, /ratings)
    │   └── storeOwnerRoutes.js    # /api/store-owner routes
    ├── services/
    │   ├── authService.js         # User registration, login, password changes
    │   ├── adminService.js        # User/store creation, dashboard stats, listings
    │   ├── userService.js         # Store browsing, ratings upsert & modification
    │   └── storeOwnerService.js   # Store owner metrics, rating details & breakdown
    ├── utils/
    │   ├── appError.js            # Custom operational error class
    │   └── token.js               # Standardized JWT sign helper
    ├── validators/
    │   ├── authValidator.js       # Field validation (Name, Password, Email, Address)
    │   ├── userValidator.js       # Admin user creation validator
    │   ├── storeValidator.js      # Store creation validator
    │   └── ratingValidator.js     # Rating integer (1-5) validator
    └── scripts/
        ├── initDb.js              # Schema migration runner
        ├── seedDb.js              # Comprehensive demo seeder
        └── testValidators.js      # 29-test automated validation suite
```

---

## 📋 Strict Assignment Validations (PDF Specifications)

All validation rules are enforced at both the API middleware layer and the PostgreSQL database constraint layer:

| Field | Rule | Implementation / Regex |
|---|---|---|
| **Name** | Min 20, Max 60 characters | `trimmed.length >= 20 && trimmed.length <= 60` |
| **Address** | Maximum 400 characters | `trimmed.length > 0 && trimmed.length <= 400` |
| **Password**| 8–16 characters, ≥1 uppercase letter, ≥1 special character | `^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\\|,.<>\/?]).{8,16}$` |
| **Email** | Standard valid email format | `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| **Rating**| Integer between 1 and 5 | `Number.isInteger(rating) && rating >= 1 && rating <= 5` |
| **Store Rating** | One rating per user per store | `CONSTRAINT uq_user_store_rating UNIQUE (user_id, store_id)` |

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- **Node.js** (v18.x or later)
- **PostgreSQL** (v12+ running locally or cloud-hosted on Neon, Supabase, Render, ElephantSQL)

### 2. Environment Configuration
Create or edit `.env` in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Or single connection string:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/store_rating_db

# JWT settings
JWT_SECRET=super_secret_jwt_key_roxiler_challenge_2026_secure
JWT_EXPIRES_IN=7d
```

### 3. Database Initialization & Seeding
Make sure your PostgreSQL database exists (e.g. `CREATE DATABASE store_rating_db;`). Then execute:

```bash
# 1. Run database migration (creates tables, foreign keys, unique constraints, indexes & triggers)
npm run db:init

# 2. Seed initial demo users, stores, and ratings
npm run db:seed
```

### 4. Run Automated Validation Test Suite
Verify that all 29 validation edge cases pass:
```bash
npm test
```

### 5. Start the Backend Server
```bash
# For development with nodemon hot-reload:
npm run dev

# For standard production start:
npm start
```
The server will start at `http://localhost:5000`.

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Name (20-60 chars) |
|---|---|---|---|
| **ADMIN** | `admin@roxiler.com` | `Admin@1234` | Platform System Administrator |
| **STORE_OWNER** | `owner.marcus@gmail.com` | `Owner@1234` | Marcus Aurelius Storekeeper |
| **STORE_OWNER** | `owner.eleanor@gmail.com` | `Owner@1234` | Eleanor Roosevelt Merchant |
| **NORMAL USER** | `user.alexander@gmail.com`| `User@1234`  | Alexander Hamilton Consumer |
| **NORMAL USER** | `user.charlotte@gmail.com`| `User@1234`  | Charlotte Bronte Reviewer |

---

## 📡 Complete API Reference & Documentation

### 1. Authentication Endpoints

#### `POST /api/auth/register` (Public)
Registers a new normal user with role `USER`.
- **Request Body:**
```json
{
  "name": "Alexander Hamilton Consumer",
  "email": "user.alexander@gmail.com",
  "password": "User@1234",
  "address": "45 Federal Plaza, Apt 12B, Financial District, Metropolis"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "Alexander Hamilton Consumer",
      "email": "user.alexander@gmail.com",
      "address": "45 Federal Plaza, Apt 12B, Financial District, Metropolis",
      "role": "USER",
      "created_at": "2026-11-24T04:20:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### `POST /api/auth/login` (Public)
Single unified login endpoint for all three roles (`ADMIN`, `USER`, `STORE_OWNER`).
- **Request Body:**
```json
{
  "email": "admin@roxiler.com",
  "password": "Admin@1234"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "name": "Platform System Administrator",
      "email": "admin@roxiler.com",
      "address": "Roxiler Systems HQ, Suite 500, Tech Park Boulevard",
      "role": "ADMIN",
      "created_at": "2026-11-24T04:20:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### `POST /api/auth/change-password` (Protected: Any authenticated role)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "oldPassword": "User@1234",
  "newPassword": "User@5678"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

#### `GET /api/auth/me` (Protected: Any authenticated role)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Returns current user details.

---

### 2. Administrator Endpoints (`/api/admin`)
*All admin endpoints require `Authorization: Bearer <adminToken>` and `role: ADMIN`.*

#### `GET /api/admin/dashboard`
Returns high-level statistics for the admin dashboard.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 7,
    "totalStores": 3,
    "totalRatings": 6,
    "userRoleCounts": {
      "admin": 1,
      "storeOwner": 3,
      "normalUser": 3
    }
  }
}
```

#### `POST /api/admin/users`
Create an Admin, Store Owner, or Normal User.
- **Request Body:**
```json
{
  "name": "Secondary System Administrator",
  "email": "admin.secondary@roxiler.com",
  "password": "Admin@1234",
  "address": "500 Corporate Hub, Suite 300, Silicon Valley",
  "role": "ADMIN"
}
```
- **Response (201 Created):** Returns created user (without password hash).

#### `POST /api/admin/stores`
Create a new store and bind it to an owner.
- **Request Body:**
```json
{
  "name": "Metropolis Gourmet Supermarket",
  "email": "contact@metropolisgourmet.com",
  "address": "100 Main Street, Suite A, Downtown Metropolis",
  "owner_id": 2
}
```
- **Response (201 Created):** Returns store and owner details.

#### `GET /api/admin/stores`
View all stores with overall average rating and owner info.
- **Query Parameters:**
  - `search`: Filter by name, email, or address
  - `sortBy`: `name`, `overall_rating`, `created_at`, `total_ratings`
  - `order`: `asc` or `desc`
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": {
    "stores": [
      {
        "id": 1,
        "name": "Metropolis Gourmet Supermarket",
        "email": "contact@metropolisgourmet.com",
        "address": "100 Main Street, Suite A, Downtown Metropolis",
        "owner_id": 2,
        "owner_name": "Marcus Aurelius Storekeeper",
        "owner_email": "owner.marcus@gmail.com",
        "overall_rating": "4.67",
        "total_ratings": 3,
        "created_at": "2026-11-24T04:20:00.000Z"
      }
    ]
  }
}
```

#### `GET /api/admin/users`
View users list with search, role filter, and sorting.
- **Query Parameters:** `search`, `role` (`ADMIN` | `USER` | `STORE_OWNER`), `sortBy`, `order`.

#### `GET /api/admin/users/:id`
View individual user details.
> **PDF Requirement:** When viewing a store owner, displays the store owner's rating and store information!
- **Response (200 OK for Store Owner):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "Marcus Aurelius Storekeeper",
      "email": "owner.marcus@gmail.com",
      "address": "104 Olive Blossom Way, North District, Metropolis",
      "role": "STORE_OWNER",
      "created_at": "2026-11-24T04:20:00.000Z",
      "store_owner_rating": 4.67,
      "stores": [
        {
          "id": 1,
          "name": "Metropolis Gourmet Supermarket",
          "email": "contact@metropolisgourmet.com",
          "address": "100 Main Street, Suite A, Downtown Metropolis",
          "overall_rating": "4.67",
          "total_ratings": 3
        }
      ]
    }
  }
}
```

---

### 3. Normal User Endpoints (`/api/user` or `/api/stores`)
*Requires `Authorization: Bearer <userToken>` and `role: USER`.*

#### `GET /api/user/stores`
View all stores. Returns overall store rating AND the logged-in user's submitted rating.
- **Query Parameters:** `search` (searches name or address), `sortBy`, `order`.
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "stores": [
      {
        "id": 1,
        "name": "Metropolis Gourmet Supermarket",
        "email": "contact@metropolisgourmet.com",
        "address": "100 Main Street, Suite A, Downtown Metropolis",
        "overall_rating": "4.67",
        "total_ratings": 3,
        "my_rating": 5,
        "my_rating_updated_at": "2026-11-24T04:20:00.000Z"
      }
    ]
  }
}
```

#### `POST /api/user/ratings`
Submit or update rating (between 1 and 5).
> **PDF Requirement:** A user can submit only ONE rating per store. They can update their rating.
- **Request Body:**
```json
{
  "store_id": 1,
  "rating": 5
}
```
- **Response (201 Created or 200 OK if updated):**
```json
{
  "success": true,
  "message": "Rating submitted successfully.",
  "data": {
    "rating": {
      "id": 1,
      "user_id": 4,
      "store_id": 1,
      "rating": 5,
      "created_at": "2026-11-24T04:20:00.000Z",
      "updated_at": "2026-11-24T04:20:00.000Z"
    },
    "isUpdated": false,
    "storeStats": {
      "overall_rating": "4.67",
      "total_ratings": 3
    }
  }
}
```

#### `PUT /api/user/ratings/:storeId`
Explicitly modify an existing rating for a store.
- **Request Body:**
```json
{
  "rating": 4
}
```

#### `GET /api/user/ratings`
Get all ratings submitted by the logged-in user.

---

### 4. Store Owner Endpoints (`/api/store-owner`)
*Requires `Authorization: Bearer <storeOwnerToken>` and `role: STORE_OWNER`.*

#### `GET /api/store-owner/dashboard`
View store average rating, total ratings, and rating distribution (1s, 2s, 3s, 4s, 5s).
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasStore": true,
    "store": {
      "id": 1,
      "name": "Metropolis Gourmet Supermarket",
      "email": "contact@metropolisgourmet.com",
      "address": "100 Main Street, Suite A, Downtown Metropolis",
      "average_rating": "4.67",
      "total_ratings": 3,
      "rating_breakdown": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 1,
        "5": 2
      }
    }
  }
}
```

#### `GET /api/store-owner/ratings`
View list of users who submitted ratings for the store, including user details and submitted ratings.
- **Query Parameters:** `sortBy` (`rating`, `created_at`, `name`), `order` (`asc` | `desc`).
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": 1,
      "name": "Metropolis Gourmet Supermarket"
    },
    "average_rating": "4.67",
    "total_ratings": 3,
    "ratings": [
      {
        "rating_id": 1,
        "rating": 5,
        "created_at": "2026-11-24T04:20:00.000Z",
        "updated_at": "2026-11-24T04:20:00.000Z",
        "user_id": 4,
        "user_name": "Alexander Hamilton Consumer",
        "user_email": "user.alexander@gmail.com",
        "user_address": "45 Federal Plaza, Apt 12B, Financial District, Metropolis"
      }
    ]
  }
}
```

---

## 🎯 Technical Interview Guide & Architectural Decisions

When explaining this implementation during technical rounds:

1. **Why Normalized PostgreSQL vs. NoSQL (MongoDB)?**
   - The Store Rating platform has strict relational constraints: Users own Stores, Users review Stores, and Ratings reference both.
   - Using PostgreSQL provides ACID transactions, composite unique constraints (`UNIQUE (user_id, store_id)`), and cascading deletes (`ON DELETE CASCADE`), ensuring database-level data integrity without orphaned records.

2. **Why UPSERT (`ON CONFLICT ... DO UPDATE`) for Ratings?**
   - The assignment requires: *"A user must be allowed to submit only ONE rating per store. They must be able to update their existing rating."*
   - Rather than executing two separate queries (`SELECT` followed by `INSERT` or `UPDATE`, which introduces race conditions in high-concurrency environments), we utilize PostgreSQL's atomic `ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating`. This prevents race conditions and ensures idempotency.

3. **Separation of Concerns (MVC + Service Layer):**
   - **Controllers:** Only handle HTTP request extraction, status codes, and JSON responses.
   - **Services:** Encapsulate core business logic, calculations (averages, breakdowns), and database queries.
   - **Validators:** Isolate pure input validation before reaching controllers.
   - This keeps the codebase testable, modular, and maintainable.

4. **Security & Parameterized Queries:**
   - All SQL statements use placeholder parameters (`$1, $2, ...`) via the `pg` driver, completely eliminating SQL Injection vulnerabilities.
   - Passwords are encrypted using `bcrypt` with salt rounds = 10; password hashes are never returned in JSON responses (`RETURNING` clauses omit password).
   - JWT tokens include user claims (`id`, `email`, `role`) and expire in 7 days.
