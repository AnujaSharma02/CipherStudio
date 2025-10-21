'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FileCreationDialogsProps {
    isCreatingFile: boolean;
    isCreatingFolder: boolean;
    newFileName: string;
    creatingInFolder: string | null;
    files: Array<{ id: string; name: string }>;
    onFileNameChange: (name: string) => void;
    onCreateFile: () => void;
    onCreateFolder: () => void;
    onDialogClose: (isFile: boolean) => void;
}

export default function FileCreationDialogs({
    isCreatingFile,
    isCreatingFolder,
    newFileName,
    creatingInFolder,
    files,
    onFileNameChange,
    onCreateFile,
    onCreateFolder,
    onDialogClose
}: FileCreationDialogsProps) {
    const { theme } = useTheme();

    return (
        <>
            <Dialog open={isCreatingFile} onOpenChange={(open) => !open && onDialogClose(true)}>
                <DialogContent className={`bg-background text-foreground border-border ${theme === 'dark' ? 'dark' : ''}`}>
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Create New File</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {creatingInFolder && (
                            <div className="text-sm text-muted-foreground">
                                Creating in: <span className="font-medium text-foreground">
                                    {files.find(f => f.id === creatingInFolder)?.name || 'Unknown folder'}
                                </span>
                            </div>
                        )}
                        <Input
                            placeholder="File name (e.g., App.jsx)"
                            value={newFileName}
                            onChange={(e) => onFileNameChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onCreateFile();
                            }}
                            className="bg-background text-foreground border-border placeholder:text-muted-foreground"
                        />
                        <Button onClick={onCreateFile} className="w-full">
                            Create File
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreatingFolder} onOpenChange={(open) => !open && onDialogClose(false)}>
                <DialogContent className={`bg-background text-foreground border-border ${theme === 'dark' ? 'dark' : ''}`}>
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {creatingInFolder && (
                            <div className="text-sm text-muted-foreground">
                                Creating in: <span className="font-medium text-foreground">
                                    {files.find(f => f.id === creatingInFolder)?.name || 'Unknown folder'}
                                </span>
                            </div>
                        )}
                        <Input
                            placeholder="Folder name"
                            value={newFileName}
                            onChange={(e) => onFileNameChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onCreateFolder();
                            }}
                            className="bg-background text-foreground border-border placeholder:text-muted-foreground"
                        />
                        <Button onClick={onCreateFolder} className="w-full">
                            Create Folder
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
