# indoseed-be-express

### Backend for PT Indo Seed Agri Makmur

## Tech Stack

- **Runtime**: Node.js (Bun is recommended for faster performance)
- **Framework**: Express.js
- **Database**: MySQL (via Prisma)
- **Architecture**: Repository Pattern
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer

## Setup

### Prerequisites

- **Node.js** installed (v16 or higher recommended)
- **MySQL** database running
- **Email Account** for sending OTPs (Gmail recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd indoseed-be-express
   ```

2. **Install dependencies**

   *If using Bun:*
   ```bash
   bun install
   ```

   *If using npm:*
   ```bash
   npm install
   ```

3. **Create environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your database credentials and other settings:
   ```env
   # Database Connection String
   DATABASE_URL="mysql://root:@localhost:3306/indoseed_erp"

   # JWT Authentication
   JWT_SECRET="your_super_secret_jwt_key_here"

   # SMTP Configuration (for sending emails)
   SMTP_USER="[EMAIL_ADDRESS]"
   SMTP_PASS="your_email_password"
   ```

4. **Generate Prisma Client**

   *If using Bun:*
   ```bash
   bunx prisma generate
   ```

   *If using npm:*
   ```bash
   npx prisma generate
   ```

5. **Apply Database Migrations**
   ```bash
   bunx prisma migrate dev --name init --seed ./prisma/seed.ts
   npx prisma migrate dev --name init --seed ./prisma/seed.ts
   ```
   *Note: The seed script will create a default superadmin user.*

## Running the Server

### Development Mode

*If using Bun:*
```bash
bun run dev
```

*If using npm:*
```bash
npm run dev
```

The server will start on `http://localhost:8080`

### Production Mode

*If using Bun:*
```bash
bun run build
bun run start
```

*If using npm:*
```bash
npm run build
npm run start
```

## API Endpoints

> **IMPORTANT**: Make sure to set the `Content-Type: application/json` header in your API client (like Postman or Insomnia) when sending POST requests, otherwise the server will not be able to read your Request Body!

### Authentication

#### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "[EMAIL_ADDRESS]",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully. Please check your email for OTP.",
  "userId": "uuid-string-here"
}
```

#### Verify OTP
```
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "userId": "uuid-string-here",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully"
}
```

#### Resend OTP
```
POST /api/auth/resend-otp
```

**Request Body:**
```json
{
  "userId": "uuid-string-here"
}
```

**Response (200 OK):**
```json
{
  "message": "A new OTP has been sent to your email."
}
```

#### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string-here",
    "username": "newuser",
    "email": "[EMAIL_ADDRESS]",
    "roles": ["user"],
    "defaultRoleId": "uuid-string-here"
  }
}
```

### Protected Route (Example)

#### Get Superadmin Data
```
GET /api/auth/superadmin-only
```

**Headers:**
```
Authorization: Bearer <token>
```

## Environment Variables

- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret key for JWT signing
- `SMTP_USER`: Email username for sending OTPs
- `SMTP_PASS`: Email password for sending OTPs

## Scripts

- `bun run dev` or `npm run dev`: Start development server
- `bun run build` or `npm run build`: Compile TypeScript to JavaScript
- `bun run start` or `npm run start`: Start production server
- `bun run seed` or `npm run seed`: Run database seed script
- `bunx prisma generate` or `npx prisma generate`: Generate Prisma client

## Folder Structure

```
indoseed-be-express/
├── src/
│   ├── controllers/   # Request HTTP handlers (Express req/res logic)
│   ├── middlewares/   # Auth middleware, validation, etc.
│   ├── routes/        # API route definitions
│   ├── services/      # Business logic (e.g., OTP generation, hashing)
│   ├── repositories/  # Database queries (Prisma interactions)
│   ├── utils/         # Helper functions, Prisma client instance
│   └── app.ts         # Express app configuration
├── prisma/
│   ├── migrations/    # Database migrations
│   ├── seed.ts        # Database seed script
│   └── schema.prisma  # Database schema
├── .env               # Environment variables (not in git)
└── package.json       # Project dependencies
```
