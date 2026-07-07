# Full-Stack Todo Application

This is a modern, full-stack web application built for high performance, scalability, and security. It features a responsive React (Next.js) frontend and a robust NestJS backend connected to MongoDB.

## 🚀 Live Links

- **Frontend (Vercel):** https://project-omega-dun-80.vercel.app/
- **Backend API (Render):** https://project-y6cy.onrender.com

## 🛠️ Technology Stack

### Frontend
- **Next.js (App Router):** Server-side rendering and static site generation for optimized SEO and performance.
- **React Hooks & Context API:** Efficient global state management for user authentication.
- **Vanilla CSS (Glassmorphism):** Custom-built, premium design system without heavy UI libraries.

### Backend
- **NestJS:** Enterprise-grade Node.js framework utilizing decorators and dependency injection.
- **MongoDB & Mongoose:** NoSQL database modeling with schemas.
- **Passport.js & JWT:** Secure user authentication with encrypted JSON Web Tokens.
- **Bcrypt:** Cryptographic password hashing to ensure database security.

## 📁 Project Architecture

The repository is organized into a monorepo structure containing both the frontend and backend microservices:

```
project/
├── frontend/             # Next.js Application
│   ├── src/app/          # App Router & UI Pages
│   ├── src/context/      # Global Authentication State
│   └── public/           # Static Assets
└── backend/              # NestJS REST API
    ├── src/auth/         # JWT Authentication & Strategies
    ├── src/users/        # User Management & Database Schema
    └── src/todos/        # CRUD Endpoints for Todos
```

## 🔒 Security Best Practices Implemented

- **Password Hashing:** Passwords are never stored in plain text.
- **Environment Variables:** All sensitive connection strings (MongoDB URI, JWT Secrets) are securely stored in `.env` files and injected into the cloud hosting environments.
- **Stateless Authentication:** JWTs are used instead of session cookies to enable high scalability and cross-domain communication between Vercel and Render.

## 💻 Local Development Setup

To run this project locally, you will need Node.js and npm installed.

### 1. Setup Backend
```bash
cd backend
npm install
# Create a .env file with MONGODB_URI=your_atlas_connection_string
npm run start:dev
```
*The backend will run on http://localhost:3001*

### 2. Setup Frontend
```bash
cd frontend
npm install
# Create a .env.local file with NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```
*The frontend will run on http://localhost:3000*
