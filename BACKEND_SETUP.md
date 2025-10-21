# CipherStudio Backend Setup

This document provides a complete guide to setting up the CipherStudio backend using Next.js API routes with TypeScript and MongoDB.

## 🏗️ Architecture Overview

- **Frontend**: Next.js with TypeScript (App Router)
- **Backend**: Next.js API Routes (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 (optional)

## 📁 Project Structure

```
src/
├── lib/
│   ├── mongodb.ts          # Database connection
│   └── auth.ts             # Authentication utilities
├── models/
│   ├── User.ts             # User model
│   ├── Project.ts          # Project model
│   └── File.ts             # File/Folder model
└── app/api/
    ├── health/
    │   └── route.ts        # Health check endpoint
    ├── users/
    │   ├── register/
    │   │   └── route.ts    # User registration
    │   ├── login/
    │   │   └── route.ts    # User login
    │   └── profile/
    │       └── route.ts    # User profile management
    ├── projects/
    │   ├── route.ts        # List/Create projects
    │   └── [id]/
    │       └── route.ts    # Get/Update/Delete project
    └── files/
        ├── route.ts        # List/Create files
        └── [id]/
            └── route.ts    # Get/Update/Delete file
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: NextAuth secret

### 3. Database Setup

#### Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and add to `.env.local`

### 4. Start Development Server

```bash
npm run dev
```

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

### Projects

#### Create Project
```http
POST /api/projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My React App",
  "description": "A sample React application",
  "isPublic": false,
  "tags": ["react", "frontend"]
}
```

#### Get User Projects
```http
GET /api/projects?page=1&limit=10&search=react
Authorization: Bearer <jwt_token>
```

#### Get Project by ID
```http
GET /api/projects/{projectId}
Authorization: Bearer <jwt_token>
```

#### Update Project
```http
PUT /api/projects/{projectId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "isPublic": true
}
```

#### Delete Project
```http
DELETE /api/projects/{projectId}
Authorization: Bearer <jwt_token>
```

### Files

#### Create File/Folder
```http
POST /api/files
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "App.jsx",
  "type": "file",
  "projectId": "project_id_here",
  "parentId": "parent_folder_id_here",
  "content": "import React from 'react';"
}
```

#### Get Files in Project
```http
GET /api/files?projectId={projectId}&parentId={parentId}
Authorization: Bearer <jwt_token>
```

#### Get File by ID
```http
GET /api/files/{fileId}
Authorization: Bearer <jwt_token>
```

#### Update File
```http
PUT /api/files/{fileId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "UpdatedFileName.jsx",
  "content": "Updated file content"
}
```

#### Delete File
```http
DELETE /api/files/{fileId}
Authorization: Bearer <jwt_token>
```

## 🔐 Authentication Flow

1. User registers/logs in
2. Server returns JWT token
3. Client stores token (localStorage/sessionStorage)
4. Client includes token in Authorization header for protected routes
5. Server validates token and grants access

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string (hashed),
  avatar?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  userId: ObjectId (ref: User),
  isPublic: boolean,
  tags: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### Files Collection
```typescript
{
  _id: ObjectId,
  name: string,
  type: 'file' | 'folder',
  projectId: ObjectId (ref: Project),
  parentId?: ObjectId (ref: File),
  s3Key?: string,
  size: number,
  mimeType?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)
- SQL injection protection (MongoDB)

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cipherstudio
JWT_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-nextauth-secret
```

## 🔧 Development Tips

1. Use MongoDB Compass for database visualization
2. Test API endpoints with Postman or Thunder Client
3. Check server logs for debugging
4. Use TypeScript for better development experience
5. Implement proper error handling in frontend

## 📝 Next Steps

1. Integrate frontend with backend APIs
2. Add AWS S3 for file storage
3. Implement NextAuth for OAuth providers
4. Add file upload functionality
5. Implement real-time collaboration features
6. Add project sharing capabilities
