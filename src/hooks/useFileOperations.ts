import { useCallback } from 'react';
import { ProjectFile, Project, EditorState, TransformedFile } from '@/types';
import { generateId, getLanguageFromName, getDefaultContent } from '@/lib/editorUtils';

interface UseFileOperationsProps {
    currentProject: { _id: string; name: string } | null;
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
    editorState: EditorState;
    setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
    createFile: (name: string, type: 'file' | 'folder', projectId: string, parentId?: string, content?: string) => Promise<{ success: boolean; error?: string }>;
    updateFile: (id: string, name?: string, content?: string) => Promise<{ success: boolean; error?: string }>;
    deleteFile: (id: string) => Promise<{ success: boolean; error?: string }>;
    files: TransformedFile[];
}

export function useFileOperations({
    currentProject,
    project,
    setProject,
    editorState,
    setEditorState,
    createFile,
    updateFile,
    deleteFile,
    files
}: UseFileOperationsProps) {
    const getFilePath = useCallback((fileId: string): string => {
        const file = project.files.find(f => f.id === fileId);
        return file ? file.path : '';
    }, [project.files]);

    const updateChildPaths = useCallback((parentId: string, newParentPath: string, files: ProjectFile[]): ProjectFile[] => {
        let updatedFiles = [...files];
        const directChildren = updatedFiles.filter(file => file.parentId === parentId);

        updatedFiles = updatedFiles.map(file => {
            if (file.parentId === parentId) {
                return {
                    ...file,
                    path: `${newParentPath}/${file.name}`,
                    lastModified: new Date().toISOString()
                };
            }
            return file;
        });

        directChildren.forEach(child => {
            if (child.isDirectory) {
                const newChildPath = `${newParentPath}/${child.name}`;
                updatedFiles = updateChildPaths(child.id, newChildPath, updatedFiles);
            }
        });

        return updatedFiles;
    }, []);

    const handleFileCreate = useCallback(async (name: string, isDirectory = false, parentId?: string) => {
        if (currentProject) {
            const defaultContent = isDirectory ? '' : getDefaultContent(name);
            const result = await createFile(name, isDirectory ? 'folder' : 'file', currentProject._id, parentId, defaultContent);

            if (result.success && files.length === 0 && !isDirectory) {
                const indexJsContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './${name}';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);`;

                const indexCssContent = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, monospace;
}`;

                await createFile('index.js', 'file', currentProject._id, parentId, indexJsContent);
                await createFile('index.css', 'file', currentProject._id, parentId, indexCssContent);
            }
        } else {
            const parentPath = parentId ? getFilePath(parentId) : '';
            const newPath = parentId ? `${parentPath}/${name}` : `/${name}`;

            const newFile: ProjectFile = {
                id: generateId(),
                name,
                content: isDirectory ? '' : getDefaultContent(name),
                language: isDirectory ? '' : getLanguageFromName(name),
                path: newPath,
                isDirectory,
                children: isDirectory ? [] : undefined,
                parentId: parentId || undefined,
                isOpen: isDirectory ? false : undefined,
                lastModified: new Date().toISOString(),
                size: isDirectory ? 0 : getDefaultContent(name).length,
            };

            setProject(prev => {
                const updatedFiles = [...prev.files, newFile];

                if (prev.files.length === 0 && !isDirectory) {
                    const indexJs: ProjectFile = {
                        id: generateId(),
                        name: 'index.js',
                        content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './${name}';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);`,
                        language: 'javascript',
                        path: '/index.js',
                        isDirectory: false,
                    };

                    const indexCss: ProjectFile = {
                        id: generateId(),
                        name: 'index.css',
                        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, monospace;
}`,
                        language: 'css',
                        path: '/index.css',
                        isDirectory: false,
                    };

                    updatedFiles.push(indexJs, indexCss);
                }

                return {
                    ...prev,
                    files: updatedFiles,
                    updatedAt: new Date().toISOString(),
                };
            });

            if (!isDirectory) {
                setEditorState(prev => ({
                    ...prev,
                    activeFile: newFile.id,
                    openFiles: [...prev.openFiles, newFile.id],
                }));
            }
        }
    }, [currentProject, createFile, getFilePath, files.length, setProject, setEditorState]);

    const handleFileDelete = useCallback(async (fileId: string) => {
        if (currentProject) {
            await deleteFile(fileId);
        } else {
            setProject(prev => ({
                ...prev,
                files: prev.files.filter(file => file.id !== fileId),
                updatedAt: new Date().toISOString(),
            }));
        }

        setEditorState(prev => ({
            ...prev,
            activeFile: prev.activeFile === fileId ? null : prev.activeFile,
            openFiles: prev.openFiles.filter(id => id !== fileId),
        }));
    }, [currentProject, deleteFile, setProject, setEditorState]);

    const handleFileRename = useCallback(async (fileId: string, newName: string) => {
        if (currentProject) {
            await updateFile(fileId, newName);
        } else {
            setProject(prev => {
                const fileToRename = prev.files.find(f => f.id === fileId);
                if (!fileToRename) return prev;

                const newPath = fileToRename.parentId ? `${getFilePath(fileToRename.parentId)}/${newName}` : `/${newName}`;

                let updatedFiles = prev.files.map(file =>
                    file.id === fileId ? {
                        ...file,
                        name: newName,
                        path: newPath,
                        lastModified: new Date().toISOString()
                    } : file
                );

                if (fileToRename.isDirectory) {
                    updatedFiles = updateChildPaths(fileId, newPath, updatedFiles);
                }

                return {
                    ...prev,
                    files: updatedFiles,
                    updatedAt: new Date().toISOString(),
                };
            });
        }
    }, [currentProject, updateFile, getFilePath, updateChildPaths, setProject]);

    const handleFileMove = useCallback((fileId: string, newParentId: string | null) => {
        setProject(prev => {
            const fileToMove = prev.files.find(f => f.id === fileId);
            if (!fileToMove) return prev;

            const newPath = newParentId ? `${getFilePath(newParentId)}/${fileToMove.name}` : `/${fileToMove.name}`;

            let updatedFiles = prev.files.map(file => {
                if (file.id === fileId) {
                    return {
                        ...file,
                        parentId: newParentId || undefined,
                        path: newPath,
                        lastModified: new Date().toISOString()
                    };
                }
                return file;
            });

            if (fileToMove.isDirectory) {
                updatedFiles = updateChildPaths(fileId, newPath, updatedFiles);
            }

            return {
                ...prev,
                files: updatedFiles,
                updatedAt: new Date().toISOString(),
            };
        });
    }, [getFilePath, updateChildPaths, setProject]);

    const handleFileCopy = useCallback((fileId: string, newParentId: string | null) => {
        const originalFile = project.files.find(f => f.id === fileId);
        if (!originalFile) return;

        const newFile: ProjectFile = {
            ...originalFile,
            id: generateId(),
            name: `${originalFile.name} (copy)`,
            path: newParentId ? `${getFilePath(newParentId)}/${originalFile.name} (copy)` : `/${originalFile.name} (copy)`,
            parentId: newParentId || undefined,
            lastModified: new Date().toISOString(),
        };

        setProject(prev => ({
            ...prev,
            files: [...prev.files, newFile],
            updatedAt: new Date().toISOString(),
        }));
    }, [project.files, getFilePath, setProject]);

    const handleFolderToggle = useCallback((folderId: string) => {
        // Update the project state for folder expansion
        setProject(prev => ({
            ...prev,
            files: prev.files.map(file =>
                file.id === folderId ? { ...file, isOpen: !file.isOpen } : file
            ),
            updatedAt: new Date().toISOString(),
        }));
    }, [setProject]);

    const handleFileUpload = useCallback((files: File[], parentId?: string) => {
        const newFiles: ProjectFile[] = files.map(file => ({
            id: generateId(),
            name: file.name,
            content: '',
            language: getLanguageFromName(file.name),
            path: parentId ? `${getFilePath(parentId)}/${file.name}` : `/${file.name}`,
            isDirectory: false,
            parentId: parentId || undefined,
            lastModified: new Date().toISOString(),
            size: file.size,
        }));

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setProject(prev => ({
                    ...prev,
                    files: prev.files.map(f =>
                        f.id === newFiles[index].id ? { ...f, content } : f
                    ),
                    updatedAt: new Date().toISOString(),
                }));
            };
            reader.readAsText(file);
        });

        setProject(prev => ({
            ...prev,
            files: [...prev.files, ...newFiles],
            updatedAt: new Date().toISOString(),
        }));
    }, [getFilePath, setProject]);

    const handleFileSelect = useCallback((fileId: string) => {
        const findFileById = (files: ProjectFile[], targetId: string): ProjectFile | null => {
            for (const file of files) {
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

        const foundFile = findFileById(project.files, fileId);

        if (foundFile) {
            setEditorState(prev => ({
                ...prev,
                activeFile: fileId,
                openFiles: prev.openFiles.includes(fileId)
                    ? prev.openFiles
                    : [...prev.openFiles, fileId],
            }));
        }
    }, [setEditorState, project.files]);

    const handleFileContentChange = useCallback((content: string) => {
        if (!editorState.activeFile) return;

        setProject(prev => ({
            ...prev,
            files: prev.files.map(file =>
                file.id === editorState.activeFile
                    ? { ...file, content, lastModified: new Date().toISOString() }
                    : file
            ),
            updatedAt: new Date().toISOString(),
        }));
    }, [editorState.activeFile, setProject]);

    const handleCloseTab = useCallback((fileId: string) => {
        setEditorState(prev => {
            const newOpenFiles = prev.openFiles.filter(id => id !== fileId);
            const newActiveFile = prev.activeFile === fileId
                ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null)
                : prev.activeFile;

            return {
                ...prev,
                activeFile: newActiveFile,
                openFiles: newOpenFiles,
            };
        });
    }, [setEditorState]);

    return {
        handleFileCreate,
        handleFileDelete,
        handleFileRename,
        handleFileMove,
        handleFileCopy,
        handleFolderToggle,
        handleFileUpload,
        handleFileSelect,
        handleFileContentChange,
        handleCloseTab,
    };
}
