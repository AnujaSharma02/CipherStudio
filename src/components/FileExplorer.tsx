'use client';

import React, { useState } from 'react';
import { FileExplorerProps, ProjectFile, DragDropState } from '@/types';
import FileTree from './FileTree';
import FileCreationDialogs from './FileCreationDialogs';
import FileExplorerHeader from './FileExplorerHeader';

export default function FileExplorer({
    files,
    activeFile,
    onFileSelect,
    onFileCreate,
    onFileDelete,
    onFileRename,
    onFileMove,
    onFileCopy,
    onFolderToggle,
    onFileUpload
}: FileExplorerProps) {
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [creatingInFolder, setCreatingInFolder] = useState<string | null>(null);
    const [dragDropState, setDragDropState] = useState<DragDropState>({
        draggedFile: null,
        dropTarget: null,
        isDragging: false
    });

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            onFileCreate(newFileName.trim(), false, creatingInFolder || undefined);
            setNewFileName('');
            setIsCreatingFile(false);
            setCreatingInFolder(null);
        }
    };

    const handleCreateFolder = () => {
        if (newFileName.trim()) {
            onFileCreate(newFileName.trim(), true, creatingInFolder || undefined);
            setNewFileName('');
            setIsCreatingFolder(false);
            setCreatingInFolder(null);
        }
    };

    const handleDialogClose = (isFile: boolean) => {
        if (isFile) {
            setIsCreatingFile(false);
        } else {
            setIsCreatingFolder(false);
        }
        setCreatingInFolder(null);
    };

    const handleDragStart = (e: React.DragEvent, file: ProjectFile) => {
        setDragDropState({ draggedFile: file, dropTarget: null, isDragging: true });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragDropState(prev => ({ ...prev, dropTarget: targetId }));
    };

    const handleDragLeave = () => {
        setDragDropState(prev => ({ ...prev, dropTarget: null }));
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const { draggedFile } = dragDropState;
        if (draggedFile && draggedFile.id !== targetId) {
            onFileMove(draggedFile.id, targetId);
        }
        setDragDropState({ draggedFile: null, dropTarget: null, isDragging: false });
    };

    const handleDragEnd = () => {
        setDragDropState({ draggedFile: null, dropTarget: null, isDragging: false });
    };

    const handleFileUpload = (files: File[]) => {
        onFileUpload(files, creatingInFolder || undefined);
    };

    return (
        <div className="h-full flex flex-col bg-sidebar-bg border-r border-sidebar-border">
            <FileExplorerHeader
                onFileUpload={handleFileUpload}
                onCreateFile={() => {
                    setCreatingInFolder(null);
                    setIsCreatingFile(true);
                }}
                onCreateFolder={() => {
                    setCreatingInFolder(null);
                    setIsCreatingFolder(true);
                }}
            />

            <FileTree
                files={files}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
                onFileDelete={onFileDelete}
                onFileRename={onFileRename}
                onFileMove={onFileMove}
                onFileCopy={onFileCopy}
                onFolderToggle={onFolderToggle}
                onCreateFileInFolder={(folderId) => {
                    setCreatingInFolder(folderId);
                    setIsCreatingFile(true);
                }}
                onCreateFolderInFolder={(folderId) => {
                    setCreatingInFolder(folderId);
                    setIsCreatingFolder(true);
                }}
                dragDropState={dragDropState}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
            />

            <FileCreationDialogs
                isCreatingFile={isCreatingFile}
                isCreatingFolder={isCreatingFolder}
                newFileName={newFileName}
                creatingInFolder={creatingInFolder}
                files={files}
                onFileNameChange={setNewFileName}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDialogClose={handleDialogClose}
            />
        </div>
    );
}
