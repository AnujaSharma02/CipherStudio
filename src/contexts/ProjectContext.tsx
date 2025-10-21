'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, Project, File } from '@/lib/api';
import { TransformedFile } from '@/types';
import { useAuth } from './AuthContext';

interface ProjectContextType {
    projects: Project[];
    currentProject: Project | null;
    files: TransformedFile[];
    isLoading: boolean;
    createProject: (name: string, description?: string, isPublic?: boolean, tags?: string[]) => Promise<{ success: boolean; error?: string }>;
    loadProjects: (page?: number, limit?: number, search?: string) => Promise<void>;
    selectProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
    deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
    loadFiles: (projectId: string, parentId?: string) => Promise<void>;
    createFile: (name: string, type: 'file' | 'folder', projectId: string, parentId?: string, content?: string) => Promise<{ success: boolean; error?: string }>;
    updateFile: (id: string, name?: string, content?: string) => Promise<{ success: boolean; error?: string }>;
    deleteFile: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

interface ProjectProviderProps {
    children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<TransformedFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            loadProjects();
            setIsInitialized(true);
        } else if (isInitialized) {
            // Only clear selected project when user logs out after initialization
            setCurrentProject(null);
            localStorage.removeItem('selectedProject');
        }
    }, [user, token, isInitialized]);

    // Restore selected project from localStorage after projects are loaded
    useEffect(() => {
        if (user && token && projects.length > 0 && !currentProject) {
            const savedProject = localStorage.getItem('selectedProject');
            if (savedProject) {
                try {
                    const parsedProject = JSON.parse(savedProject);
                    // Verify the project still exists in the loaded projects
                    const projectExists = projects.some(p => p._id === parsedProject._id);
                    if (projectExists) {
                        setCurrentProject(parsedProject);
                        loadFiles(parsedProject._id);
                    } else {
                        // Clear invalid project from localStorage
                        localStorage.removeItem('selectedProject');
                    }
                } catch {
                    console.error('Failed to restore selected project:');
                    localStorage.removeItem('selectedProject');
                }
            }
        }
    }, [user, token, projects, currentProject]);

    const createProject = async (name: string, description = '', isPublic = false, tags: string[] = []) => {
        setIsLoading(true);
        try {
            const response = await apiService.createProject(name, description, isPublic, tags);
            if (response.data) {
                const newProject = response.data.project;
                setProjects(prev => [newProject, ...prev]);
                selectProject(newProject);
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to create project' };
            }
        } catch {
            return { success: false, error: 'Network error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const loadProjects = async (page = 1, limit = 10, search?: string) => {
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await apiService.getProjects(page, limit, search);
            if (response.data) {
                setProjects(response.data.projects);
            }
        } catch {
            console.error('Failed to load projects:',);
        } finally {
            setIsLoading(false);
        }
    };

    const selectProject = (project: Project) => {
        setCurrentProject(project);
        // Save selected project to localStorage
        localStorage.setItem('selectedProject', JSON.stringify(project));
        loadFiles(project._id);
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        setIsLoading(true);
        try {
            const response = await apiService.updateProject(
                id,
                updates.name,
                updates.description,
                updates.isPublic,
                updates.tags
            );
            if (response.data) {
                setProjects(prev => prev.map(p => p._id === id ? response.data!.project : p));
                if (currentProject?._id === id) {
                    setCurrentProject(response.data.project);
                }
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to update project' };
            }
        } catch {
            return { success: false, error: 'Network error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await apiService.deleteProject(id);
            if (response.data) {
                setProjects(prev => prev.filter(p => p._id !== id));
                if (currentProject?._id === id) {
                    setCurrentProject(null);
                    setFiles([]);
                    // Clear selected project from localStorage if it was deleted
                    localStorage.removeItem('selectedProject');
                }
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to delete project' };
            }
        } catch {
            return { success: false, error: 'Network error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const loadFiles = async (projectId: string, parentId?: string) => {
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await apiService.getFiles(projectId, parentId);
            if (response.data) {

                const calculateFilePath = (file: File, allFiles: File[]): string => {
                    if (file.path) {
                        return file.path;
                    }

                    if (!file.parentId) {
                        return `/${file.name}`;
                    }

                    const parent = allFiles.find(f => f._id === file.parentId);
                    if (!parent) {
                        return `/${file.name}`;
                    }

                    const parentPath = calculateFilePath(parent, allFiles);
                    return `${parentPath}/${file.name}`;
                };
                const transformedFiles = response.data.files.map((file: File) => ({
                    ...file,
                    id: file._id,
                    content: file.content || '',
                    language: file.name.split('.').pop() || 'text',
                    path: calculateFilePath(file, response.data?.files || []),
                    type: file.type,
                    isDirectory: file.type === 'folder',
                    children: file.type === 'folder' ? [] : undefined,
                    isOpen: file.type === 'folder' ? true : undefined,
                    updatedAt: file.updatedAt
                }));

                const fileMap = new Map();
                const rootFiles: TransformedFile[] = [];

                transformedFiles.forEach(file => {
                    fileMap.set(file.id, file);
                });

                transformedFiles.forEach(file => {
                    if (file.parentId && fileMap.has(file.parentId)) {
                        const parent = fileMap.get(file.parentId);
                        if (parent.isDirectory && parent.children) {
                            parent.children.push(file);
                        }
                    }
                });

                transformedFiles.forEach(file => {
                    if (!file.parentId) {
                        rootFiles.push(file);
                    }
                });

                setFiles(rootFiles);
            }
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createFile = async (name: string, type: 'file' | 'folder', projectId: string, parentId?: string, content?: string) => {
        setIsLoading(true);
        try {
            const response = await apiService.createFile(name, type, projectId, parentId, content);
            if (response.data) {
                await loadFiles(projectId);
                return { success: true };
            } else {
                // Even if the API returns an error, try to refresh the file list
                // because the file might have been created in the database
                await loadFiles(projectId);
                return { success: false, error: response.error || 'Failed to create file' };
            }
        } catch (error) {
            console.error('Error creating file:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const updateFile = async (id: string, name?: string, content?: string) => {
        setIsLoading(true);
        try {
            const findFileById = (fileList: TransformedFile[], targetId: string): TransformedFile | null => {
                for (const file of fileList) {
                    if (file.id === targetId) {
                        return file;
                    }
                    if (file.children && file.children.length > 0) {
                        const found = findFileById(file.children, targetId);
                        if (found) return found;
                    }
                }
                return null;
            };

            const currentFile = findFileById(files, id);
            const filePath = currentFile ? currentFile.path : undefined;


            const response = await apiService.updateFile(id, name, content, filePath);
            if (response.data) {
                const updateFileInTree = (fileList: TransformedFile[]): TransformedFile[] => {
                    return fileList.map(f => {
                        if (f.id === id) {
                            return {
                                ...f,
                                ...response.data!.file,
                                children: f.children || undefined,
                                isDirectory: f.isDirectory
                            };
                        }
                        if (f.children && f.children.length > 0) {
                            return {
                                ...f,
                                children: updateFileInTree(f.children)
                            };
                        }
                        return f;
                    });
                };

                setFiles(prev => updateFileInTree(prev));
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to update file' };
            }
        } catch (error) {
            console.error('Update file error:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteFile = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await apiService.deleteFile(id);
            if (response.data) {
                // After successful deletion, reload the files to get the updated structure
                if (currentProject) {
                    await loadFiles(currentProject._id);
                }
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to delete file' };
            }
        } catch (error) {
            console.error('Delete file error:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setIsLoading(false);
        }
    };

    const value: ProjectContextType = {
        projects,
        currentProject,
        files,
        isLoading,
        createProject,
        loadProjects,
        selectProject,
        updateProject,
        deleteProject,
        loadFiles,
        createFile,
        updateFile,
        deleteFile,
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
