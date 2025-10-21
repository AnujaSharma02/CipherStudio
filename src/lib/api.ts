const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

interface Project {
    _id: string;
    name: string;
    description: string;
    userId: string;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface File {
    _id: string;
    name: string;
    type: 'file' | 'folder';
    projectId: string;
    parentId?: string;
    path?: string;
    content?: string;
    s3Key?: string;
    size: number;
    mimeType?: string;
    createdAt: string;
    updatedAt: string;
}

interface AuthResponse {
    token: string;
    user: User;
    message: string;
}

interface ProjectsResponse {
    projects: Project[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

class ApiService {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const url = `${API_BASE_URL}/api${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                return { error: data.error || 'An error occurred' };
            }

            return { data };
        } catch {
            return { error: 'Network error occurred' };
        }
    }

    // Auth endpoints
    async register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
        return this.request<AuthResponse>('/users/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    }

    async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
        return this.request<AuthResponse>('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getProfile(): Promise<ApiResponse<{ user: User }>> {
        return this.request<{ user: User }>('/users/profile');
    }

    async updateProfile(username?: string, avatar?: string): Promise<ApiResponse<{ user: User; message: string }>> {
        return this.request<{ user: User; message: string }>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify({ username, avatar }),
        });
    }

    // Project endpoints
    async getProjects(page = 1, limit = 10, search?: string): Promise<ApiResponse<ProjectsResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
        });
        return this.request<ProjectsResponse>(`/projects?${params}`);
    }

    async createProject(
        name: string,
        description = '',
        isPublic = false,
        tags: string[] = []
    ): Promise<ApiResponse<{ project: Project; message: string }>> {
        return this.request<{ project: Project; message: string }>('/projects', {
            method: 'POST',
            body: JSON.stringify({ name, description, isPublic, tags }),
        });
    }

    async getProject(id: string): Promise<ApiResponse<{ project: Project }>> {
        return this.request<{ project: Project }>(`/projects/${id}`);
    }

    async updateProject(
        id: string,
        name?: string,
        description?: string,
        isPublic?: boolean,
        tags?: string[]
    ): Promise<ApiResponse<{ project: Project; message: string }>> {
        return this.request<{ project: Project; message: string }>(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, description, isPublic, tags }),
        });
    }

    async deleteProject(id: string): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/projects/${id}`, {
            method: 'DELETE',
        });
    }

    // File endpoints
    async getFiles(projectId: string, parentId?: string): Promise<ApiResponse<{ files: File[] }>> {
        const params = new URLSearchParams({ projectId });
        if (parentId) params.append('parentId', parentId);
        return this.request<{ files: File[] }>(`/files?${params}`);
    }

    async createFile(
        name: string,
        type: 'file' | 'folder',
        projectId: string,
        parentId?: string,
        content?: string
    ): Promise<ApiResponse<{ file: File; message: string }>> {
        return this.request<{ file: File; message: string }>('/files', {
            method: 'POST',
            body: JSON.stringify({ name, type, projectId, parentId, content }),
        });
    }

    async getFile(id: string): Promise<ApiResponse<{ file: File }>> {
        return this.request<{ file: File }>(`/files/${id}`);
    }

    async updateFile(id: string, name?: string, content?: string, path?: string): Promise<ApiResponse<{ file: File; message: string }>> {
        return this.request<{ file: File; message: string }>(`/files/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, content, path }),
        });
    }

    async deleteFile(id: string): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/files/${id}`, {
            method: 'DELETE',
        });
    }

    // Health check
    async healthCheck(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
        return this.request<{ status: string; message: string; timestamp: string }>('/health');
    }
}

export const apiService = new ApiService();
export type { User, Project, File, AuthResponse, ProjectsResponse };
