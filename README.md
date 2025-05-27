# Authentication and Comment Permission Backend Service

A secure backend service built with Node.js, Express, Prisma, and PostgreSQL (Neon) that handles user authentication, session management, and comment-level access control using role-based permissions.

## Features

* **User Authentication**: Signup, login, logout using JWT tokens
* **Session Management**: Access tokens (short-lived) & Refresh tokens (long-lived)
* **Role-Based Permissions**: Comment access via read, write, delete privileges
* **Secure Password Handling**: Bcrypt hashing and password reset flow
* **Comment System**: CRUD with permission checks
* **Security Middleware**: Helmet, rate limiting, CORS, validation
* **Database**: PostgreSQL with Prisma ORM

## Tech Stack

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL (Neon)
* JWT (access & refresh tokens)
* Bcrypt
* Joi (validation)

## Setup Instructions

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn
* Git

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd auth-comment-service/server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   * Create `.env` in server folder
   * Fill in values:

   ```env
   DATABASE_URL="your-neon-database-url"
   JWT_SECRET="your-jwt-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   NODE_ENV="development"
   PORT=5000
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start the Server**

   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/refresh-token

```json
{
  "refreshToken": "your-refresh-token"
}
```

#### POST /api/auth/logout

```json
{
  "refreshToken": "your-refresh-token"
}
```

#### POST /api/auth/forgot-password

```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/reset-password

```json
{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

### User Management Endpoints

#### GET /api/users/profile

Get the current user profile (requires authentication)

#### GET /api/users/all

Get all users (admin only)

#### PUT /api/users/\:userId/permissions

Update user permissions (admin only)

```json
{
  "canRead": true,
  "canWrite": false,
  "canDelete": false
}
```

### Comment Endpoints

#### GET /api/comments

Get all comments (requires read permission)

#### POST /api/comments

Create a comment (requires write permission)

```json
{
  "content": "This is a comment"
}
```

#### PUT /api/comments/\:commentId

Update a comment (write permission, own comment only)

```json
{
  "content": "Updated comment"
}
```

#### DELETE /api/comments/\:commentId

Delete a comment (requires delete permission)

## Testing

### Test Users (from seed data)

* **Admin**: `admin@example.com` / `admin123` (all permissions)
* **User**: `user@example.com` / `user123` (read, write)
* **Read-only**: `readonly@example.com` / `readonly123` (read only)

### Run Tests

```bash
npm test
```

## Database Schema

### Users Table

* `id` (String, PK)
* `name` (String)
* `email` (String, unique)
* `password` (String, hashed)
* `canRead`, `canWrite`, `canDelete` (Boolean)
* `createdAt`, `updatedAt` (DateTime)

### Comments Table

* `id` (String, PK)
* `content` (String)
* `authorId` (FK to User)
* `createdAt`, `updatedAt` (DateTime)

### RefreshTokens Table

* `id` (String, PK)
* `token` (String, unique)
* `userId` (FK to User)
* `expiresAt`, `createdAt` (DateTime)

### PasswordResetTokens Table

* `id` (String, PK)
* `token` (String, unique)
* `email` (String)
* `expiresAt` (DateTime)
* `used` (Boolean)
* `createdAt` (DateTime)

## Security Features

* **Bcrypt Hashing**
* **JWT Access & Refresh Tokens**
* **Rate Limiting & Helmet Middleware**
* **CORS Configured for Frontend URL**
* **Joi Input Validation**
* **SQL Injection Safe via Prisma ORM**

## Deployment

### Backend Deployment (Render/Vercel/Railway/Heroku)

1. Set environment variables in the dashboard
2. Run:

   ```bash
   npx prisma migrate deploy
   ```
3. Deploy your server via Git or CLI

---

## Frontend (React + Vite)

The frontend is a simple React app built using **Vite**, located inside the `client` folder. It consumes the backend APIs and demonstrates authentication, permissions, and comment functionalities.

### Frontend Setup

1. **Navigate to the client folder**

   ```bash
   cd ../client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

   App runs at `http://localhost:5173`

**Environment Setup for frontend**

   * Create `.env` in client folder
   * Fill in values:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
---

## Note on Render Server Downtime

The backend for this project is deployed on Render. Occasionally, the Render server may return a 502 Bad Gateway error due to cold starts or temporary downtime (especially if the service has been idle).
If this happens, wait about 1 minute, then try hitting the API once or twice. The server should start responding normally after that.
