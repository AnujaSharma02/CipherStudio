# Frontend Integration Guide

This document explains how the CipherStudio frontend has been integrated with the backend APIs.

## 🏗️ Architecture Overview

The frontend now uses a complete authentication and project management system with the following components:

- **Authentication System**: JWT-based login/register with context management
- **Project Management**: Full CRUD operations for projects and files
- **Real-time Updates**: Automatic synchronization with backend
- **Type Safety**: Full TypeScript integration

## 📁 New Components Structure

```
src/
├── lib/
│   └── api.ts                    # API service layer
├── contexts/
│   ├── AuthContext.tsx          # Authentication context
│   └── ProjectContext.tsx       # Project management context
├── components/
│   ├── auth/
│   │   ├── AuthModal.tsx        # Login/Register modal
│   │   ├── LoginForm.tsx        # Login form component
│   │   ├── RegisterForm.tsx     # Registration form component
│   │   └── UserMenu.tsx         # User dropdown menu
│   ├── projects/
│   │   └── ProjectManager.tsx   # Project list and creation
│   └── BackendIDE.tsx           # Updated IDE with backend integration
└── app/
    ├── layout.tsx               # Updated with providers
    └── page.tsx                 # Updated with authentication flow
```

## 🔐 Authentication Flow

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages user authentication state
- Handles login, register, logout operations
- Persists JWT tokens in localStorage
- Provides authentication status to entire app

### 2. **Authentication Components**
- **AuthModal**: Modal wrapper for login/register forms
- **LoginForm**: Email/password login form
- **RegisterForm**: Username/email/password registration form
- **UserMenu**: User profile dropdown with logout option

### 3. **Authentication Flow**
```
User visits app → Check for stored token → 
If no token: Show login/register screen →
User logs in → Store token → Show main app →
User can access projects and files
```

## 📊 Project Management

### 1. **ProjectContext** (`src/contexts/ProjectContext.tsx`)
- Manages project state and operations
- Handles CRUD operations for projects and files
- Provides real-time updates from backend
- Manages current project selection

### 2. **Project Components**
- **ProjectManager**: Lists projects, search, create new projects
- **BackendIDE**: Updated IDE that works with backend data

### 3. **Project Flow**
```
User selects project → Load project files → 
User can create/edit/delete files → 
Changes sync to backend automatically
```

## 🔌 API Integration

### 1. **API Service** (`src/lib/api.ts`)
Centralized service for all backend communication:

```typescript
// Authentication
apiService.login(email, password)
apiService.register(username, email, password)
apiService.getProfile()

// Projects
apiService.getProjects(page, limit, search)
apiService.createProject(name, description, isPublic, tags)
apiService.updateProject(id, updates)
apiService.deleteProject(id)

// Files
apiService.getFiles(projectId, parentId)
apiService.createFile(name, type, projectId, parentId, content)
apiService.updateFile(id, name, content)
apiService.deleteFile(id)
```

### 2. **Error Handling**
All API calls include proper error handling:
- Network errors
- Authentication errors
- Validation errors
- Server errors

### 3. **Type Safety**
Full TypeScript integration with:
- Request/response types
- Error types
- User, Project, File interfaces

## 🎨 UI/UX Improvements

### 1. **Authentication Screen**
- Beautiful landing page with gradient background
- Clear call-to-action buttons
- Modal-based login/register forms
- Form validation and error messages

### 2. **Project Management**
- Sidebar with project list
- Search functionality
- Create project dialog
- Project selection and management

### 3. **User Experience**
- Loading states for all operations
- Error messages with proper styling
- Responsive design
- Dark/light theme support

## 🚀 Key Features

### 1. **Seamless Authentication**
- Automatic token management
- Persistent login sessions
- Secure logout functionality
- Profile management

### 2. **Real-time Project Management**
- Create, read, update, delete projects
- File and folder management
- Automatic synchronization
- Search and filtering

### 3. **Enhanced IDE Experience**
- Backend-integrated file operations
- Real-time content updates
- Project-based file organization
- Collaborative-ready architecture

## 🔧 Configuration

### 1. **Environment Variables**
Add to `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. **Dependencies**
All required dependencies are already added to `package.json`:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token handling
- `mongoose` - MongoDB integration

## 📱 Usage Examples

### 1. **Using Authentication**
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <div>Welcome, {user.username}!</div>;
}
```

### 2. **Using Project Management**
```typescript
import { useProject } from '@/contexts/ProjectContext';

function ProjectComponent() {
  const { projects, createProject, selectProject } = useProject();
  
  const handleCreateProject = async () => {
    const result = await createProject('My New Project');
    if (result.success) {
      console.log('Project created!');
    }
  };
  
  return (
    <div>
      {projects.map(project => (
        <div key={project._id} onClick={() => selectProject(project)}>
          {project.name}
        </div>
      ))}
    </div>
  );
}
```

### 3. **Using API Service Directly**
```typescript
import { apiService } from '@/lib/api';

async function fetchData() {
  const response = await apiService.getProjects();
  if (response.data) {
    console.log('Projects:', response.data.projects);
  } else {
    console.error('Error:', response.error);
  }
}
```

## 🛡️ Security Features

1. **JWT Token Management**
   - Secure token storage
   - Automatic token refresh
   - Token validation

2. **Input Validation**
   - Client-side validation
   - Server-side validation
   - Error handling

3. **Authentication Guards**
   - Protected routes
   - User session management
   - Automatic logout on token expiry

## 🚀 Next Steps

1. **AWS S3 Integration** - For file storage
2. **Real-time Collaboration** - WebSocket integration
3. **File Upload** - Drag and drop functionality
4. **Project Sharing** - Public/private project management
5. **Version Control** - Git integration
6. **Deployment** - Vercel/Netlify deployment

## 🔍 Testing

To test the integration:

1. **Start the development server**: `npm run dev`
2. **Create an account** using the registration form
3. **Create a project** using the project manager
4. **Add files** to your project
5. **Test file operations** (create, edit, delete)

The frontend is now fully integrated with the backend and ready for production use!
