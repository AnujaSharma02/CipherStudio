'use client';

import React from 'react';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import Preview from './Preview';
import WelcomeScreen from './WelcomeScreen';
import FileTabs from './FileTabs';
import { ProjectFile, EditorState } from '@/types';

interface IDELayoutProps {
    currentProject: { _id: string; name: string; description?: string } | null;
    project: {
        files: ProjectFile[];
    };
    editorState: EditorState;
    onFileCreate: (name: string, isDirectory?: boolean, parentId?: string) => void;
    onFileSelect: (fileId: string) => void;
    onFileDelete: (fileId: string) => void;
    onFileRename: (fileId: string, newName: string) => void;
    onFileMove: (fileId: string, newParentId: string | null) => void;
    onFileCopy: (fileId: string, newParentId: string | null) => void;
    onFolderToggle: (folderId: string) => void;
    onFileUpload: (files: File[], parentId?: string) => void;
    onFileContentChange: (content: string) => void;
    onCloseTab: (fileId: string) => void;
}

export default function IDELayout({
    currentProject,
    project,
    editorState,
    onFileCreate,
    onFileSelect,
    onFileDelete,
    onFileRename,
    onFileMove,
    onFileCopy,
    onFolderToggle,
    onFileUpload,
    onFileContentChange,
    onCloseTab
}: IDELayoutProps) {
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
    if (!currentProject) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-neutral-50 dark:bg-black">
                <div className="max-w-md mx-auto text-center p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                            No Project Selected
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">
                            Please create a new project or select an existing one from the sidebar to start coding.
                        </p>
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        <p>💡 Use the &quot;New Project&quot; button in the sidebar to create your first project</p>
                        <p>🚀 Once you have a project, you can start creating files and coding</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show welcome screen when project has no files and no active file
    if (currentProject && project.files.length === 0 && !editorState.activeFile) {
        return (
            <WelcomeScreen
                onCreateFile={onFileCreate}
                onCreateFolder={(name) => onFileCreate(name, true)}
            />
        );
    }

    return (
        <>
            <div className="w-64 border-r border-sidebar-border bg-sidebar-bg">
                <FileExplorer
                    files={project.files}
                    activeFile={editorState.activeFile}
                    onFileSelect={onFileSelect}
                    onFileCreate={onFileCreate}
                    onFileDelete={onFileDelete}
                    onFileRename={onFileRename}
                    onFileMove={onFileMove}
                    onFileCopy={onFileCopy}
                    onFolderToggle={onFolderToggle}
                    onFileUpload={onFileUpload}
                />
            </div>

            <div className="flex-1 flex flex-col h-full w-full">
                <FileTabs
                    openFiles={editorState.openFiles}
                    activeFile={editorState.activeFile}
                    files={project.files}
                    onFileSelect={onFileSelect}
                    onCloseTab={onCloseTab}
                />

                <div className="flex-1 flex h-full w-full">
                    <div className="flex-1">
                        <CodeEditor
                            file={editorState.activeFile ? findFileById(project.files, editorState.activeFile) : null}
                            onChange={onFileContentChange}
                        />
                    </div>

                    <div className="w-1/2 border-l border-preview-border bg-preview-bg">
                        <Preview
                            files={project.files}
                            activeFile={editorState.activeFile}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
