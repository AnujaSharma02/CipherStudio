'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ProjectFile } from '@/types';
import { X } from 'lucide-react';

interface FileTabsProps {
    openFiles: string[];
    activeFile: string | null;
    files: ProjectFile[];
    onFileSelect: (fileId: string) => void;
    onCloseTab: (fileId: string) => void;
}

export default function FileTabs({
    openFiles,
    activeFile,
    files,
    onFileSelect,
    onCloseTab
}: FileTabsProps) {
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

    if (openFiles.length === 0) return null;

    return (
        <div className="h-8 bg-tab-bg border-b border-tab-border flex items-center overflow-x-auto">
            {openFiles.map(fileId => {
                const file = findFileById(files, fileId);
                if (!file) return null;

                return (
                    <div
                        key={fileId}
                        className={`flex items-center gap-2 px-3 py-1 border-r border-tab-border cursor-pointer group min-w-0 transition-colors ${activeFile === fileId
                            ? 'bg-tab-active-bg text-foreground'
                            : 'hover:bg-muted/50 text-muted-foreground'
                            }`}
                        onClick={() => onFileSelect(fileId)}
                    >
                        <span className="text-sm truncate max-w-32">
                            {file.name}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(fileId);
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
