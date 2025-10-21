'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProjectFile, Project, EditorState, TransformedFile } from '@/types';
import { getLanguageFromName } from '@/lib/editorUtils';
import { useProject } from '@/contexts/ProjectContext';
import { useFileOperations } from '@/hooks/useFileOperations';
import LoadingSpinner from './LoadingSpinner';
import IDEHeader from './IDEHeader';
import IDELayout from './IDELayout';

export default function IDE() {
    const { currentProject, files, projects, createFile, updateFile, deleteFile, updateProject, isLoading } = useProject();

    const [project, setProject] = useState<Project>({
        id: 'default-project',
        name: 'My React Project',
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const [editorState, setEditorState] = useState<EditorState>({
        activeFile: null,
        openFiles: [],
        autosave: true,
    });

    const [isSaving, setIsSaving] = useState(false);

    const {
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
    } = useFileOperations({
        currentProject,
        project,
        setProject,
        editorState,
        setEditorState,
        createFile,
        updateFile,
        deleteFile,
        files
    });

    useEffect(() => {
        if (currentProject) {
            setProject({
                id: currentProject._id,
                name: currentProject.name,
                files: [],
                createdAt: currentProject.createdAt,
                updatedAt: currentProject.updatedAt,
            });
        }
    }, [currentProject]);

    useEffect(() => {
        if (currentProject && files !== null && files !== undefined) {
            const convertFile = (file: TransformedFile): ProjectFile => ({
                id: file.id,
                name: file.name,
                content: file.content || '',
                language: getLanguageFromName(file.name),
                path: file.path || `/${file.name}`,
                isDirectory: file.type === 'folder',
                children: file.children,
                parentId: file.parentId || undefined,
                isOpen: file.isOpen,
                lastModified: file.lastModified || file.updatedAt,
                size: file.size,
            });

            const convertedFiles: ProjectFile[] = files.map(convertFile);

            setProject(prev => {
                const findFileById = (fileList: ProjectFile[], targetId: string): ProjectFile | null => {
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

                const preservedFiles = convertedFiles.map(newFile => {
                    if (newFile.isDirectory && prev.files) {
                        const existingFile = findFileById(prev.files, newFile.id);
                        if (existingFile && existingFile.isOpen !== undefined) {
                            return { ...newFile, isOpen: existingFile.isOpen };
                        }
                    }
                    if (editorState.activeFile === newFile.id && prev.files) {
                        const existingFile = findFileById(prev.files, newFile.id);
                        if (existingFile && existingFile.content !== newFile.content) {
                            return { ...newFile, content: existingFile.content };
                        }
                    }
                    return newFile;
                });

                return {
                    ...prev,
                    id: currentProject._id,
                    name: currentProject.name,
                    files: preservedFiles,
                    updatedAt: currentProject.updatedAt,
                };
            });
        }
    }, [currentProject, files, editorState.activeFile]);

    useEffect(() => {
        if (!currentProject) {
            const savedProject = localStorage.getItem('cipherstudio-project');
            const savedState = localStorage.getItem('cipherstudio-state');

            if (savedProject) {
                try {
                    setProject(JSON.parse(savedProject));
                } catch {
                    console.error('Failed to load project');
                }
            }

            if (savedState) {
                try {
                    setEditorState(JSON.parse(savedState));
                } catch {
                    console.error('Failed to load editor state');
                }
            }
        }
    }, [currentProject]);

    const saveToLocalStorage = useCallback(async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        localStorage.setItem('cipherstudio-project', JSON.stringify(project));
        localStorage.setItem('cipherstudio-state', JSON.stringify(editorState));
        setIsSaving(false);
    }, [project, editorState]);

    const handleManualSave = useCallback(async () => {
        if (!editorState.activeFile || !currentProject) return;

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

        const activeFile = findFileById(project.files, editorState.activeFile);
        if (!activeFile) return;

        setIsSaving(true);
        try {
            const result = await updateFile(editorState.activeFile, undefined, activeFile.content);
            if (!result.success) {
                console.error('Failed to save file:', result.error);
            }
        } finally {
            setIsSaving(false);
        }
    }, [editorState.activeFile, currentProject, project.files, updateFile]);

    useEffect(() => {
        if (editorState.autosave) {
            const timeoutId = setTimeout(() => {
                saveToLocalStorage();
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [project, editorState, editorState.autosave, saveToLocalStorage]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 's') {
                event.preventDefault();
                if (currentProject) {
                    handleManualSave();
                } else {
                    saveToLocalStorage();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentProject, handleManualSave, saveToLocalStorage]);


    const handleSaveProject = () => {
        saveToLocalStorage();
    };

    const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedProject = JSON.parse(e.target?.result as string);
                setProject(loadedProject);
                alert('Project loaded successfully!');
            } catch {
                alert('Failed to load project. Please check the file format.');
            }
        };
        reader.readAsText(file);
    };

    const handleExportProject = () => {
        const dataStr = JSON.stringify(project, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };


    const toggleAutosave = () => {
        setEditorState(prev => ({
            ...prev,
            autosave: !prev.autosave,
        }));
    };

    const handleProjectNameChange = (newName: string) => {
        setProject(prev => ({ ...prev, name: newName }));
    };

    const handleProjectNameBlur = async () => {
        if (currentProject && project.name.trim() !== currentProject.name) {
            const result = await updateProject(currentProject._id, { name: project.name.trim() });
            if (!result.success) {
                setProject(prev => ({ ...prev, name: currentProject.name }));
            }
        }
    };



    if (isLoading && !currentProject && projects.length === 0) {
        return <LoadingSpinner message="Loading CipherStudio..." size="lg" />;
    }

    return (
        <div className="h-full w-full flex flex-col">
            <IDEHeader
                projectName={project.name}
                isSaving={isSaving}
                autosave={editorState.autosave}
                onProjectNameChange={handleProjectNameChange}
                onProjectNameBlur={handleProjectNameBlur}
                onSave={currentProject ? handleManualSave : handleSaveProject}
                onLoadProject={handleLoadProject}
                onExportProject={handleExportProject}
                onToggleAutosave={toggleAutosave}
            />

            <div className="flex-1 flex">
                <IDELayout
                    currentProject={currentProject}
                    project={project}
                    editorState={editorState}
                    onFileCreate={handleFileCreate}
                    onFileSelect={handleFileSelect}
                    onFileDelete={handleFileDelete}
                    onFileRename={handleFileRename}
                    onFileMove={handleFileMove}
                    onFileCopy={handleFileCopy}
                    onFolderToggle={handleFolderToggle}
                    onFileUpload={handleFileUpload}
                    onFileContentChange={handleFileContentChange}
                    onCloseTab={handleCloseTab}
                />
            </div>
        </div>
    );
}
