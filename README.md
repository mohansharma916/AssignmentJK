# Project Documentation

## Overview

This project is a comprehensive backend application built using **NestJS**. It incorporates multiple modules to handle distinct functionalities, including authentication, user management, document handling, and data ingestion. The system is designed with security, scalability, and maintainability in mind, leveraging role-based access control, structured DTOs, and database integration with Prisma ORM.

---

## Features




### Authentication Module



- **User Registration**: Register new users.

- **User Login**: Authenticate users and provide JWT tokens.

- **Role-Based Access Control (RBAC)**: Restrict access to certain endpoints based on roles (e.g., Admin).

### User Module
- **User Management**: CRUD operations for user entities.
- **Role Management**: Admin-only access to certain operations.

### Document Module
- **File Upload**: Upload and store files with size restrictions.
- **Document Management**: CRUD operations for document metadata.
- **Streamable Downloads**: Retrieve uploaded files.

### Ingestion Module
- **Trigger Ingestion**: Start ingestion processes with customizable configurations.
- **Process Tracking**: Monitor ingestion status.
- **Process Management**: Retrieve or delete ingestion processes.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [NestJS CLI](https://docs.nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- A database (e.g., PostgreSQL, MySQL, SQLite).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mohansharma916/JK_ASSIGNMENT
   cd JK_ASSIGNMENT
   ```

2. Install dependencies:
    ```
    npm install
    ```

3. Set up your database:

Configure your .env file with database credentials.
use can use .env.example by removing ".example" i have added a database link 
Generate Prisma client and apply migrations:

```
npx prisma generate
npx prisma migrate dev
npx prisma db push 

```



3a. (Optional) If you want to create Demo data of 1000 user 

```
npx prisma seed

```

4. Start the application:

```
npm run start:dev

```

## Modules and Endpoints
### 1. Authentication Module

Base URL: /auth
Register User

URL: /auth/register
Method: POST
Body:
```

{
  "username": "string",
  "password": "string",
  "email": "string"
}
```
Response: 201 Created
User Login

URL: /auth/login
Method: POST
Body:
```
{
  "username": "string",
  "password": "string"
}

```
Response: 200 OK
Get All Users (Admin Only)

URL: /auth
Method: GET
Headers:
```
{
  "Authorization": "Bearer <access-token>"
}
```

## 2. User Module

Base URL: /users

Get All Users: GET /users (Admin Only)

Get User by ID: GET /users/:id

Update User: PATCH /users/:id (Admin Only)

Delete User: DELETE /users/:id (Admin Only)


## 3. Document Module

Base URL: /documents

Upload a Document: POST /documents/upload (Admin Only)

Get Document by Name: GET /documents/:name

Create Document Entry: POST /documents

Get All Documents: GET /documents

Get Document by ID: GET /documents/:id

Update Document: PATCH /documents/:id

Delete Document: DELETE /documents/:id


## 4. Ingestion Module

Base URL: /ingestion

Trigger Ingestion: POST /ingestion/trigger

Get Process Status: GET /ingestion/status/:id

List All Processes: GET /ingestion/all

Delete Process: DELETE /ingestion/:id

# Role Management

Role-based access control is implemented across the project.


# Implementation
Decorator: @Roles(Role.ADMIN)

Guards: RolesGuard, JwtAuthGuard



# Project Structure
```

src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   └── role.enum.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── documents/
│   ├── documents.controller.ts
│   ├── documents.service.ts
│   └── dto/
├── ingestion/
│   ├── ingestion.controller.ts
│   ├── ingestion.service.ts
│   └── dto/
└── common/
    ├── decorators/
    └── guards/
```

