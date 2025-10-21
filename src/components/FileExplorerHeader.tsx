'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Folder } from 'lucide-react';

interface FileExplorerHeaderProps {
    onFileUpload: (files: File[], parentId?: string) => void;
    onCreateFile: () => void;
    onCreateFolder: () => void;
}

export default function FileExplorerHeader({
    onFileUpload,
    onCreateFile,
    onCreateFolder
}: FileExplorerHeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onFileUpload(files);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-3 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-foreground">Files</h3>
                <div className="flex gap-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".js,.jsx,.ts,.tsx,.css,.html,.json,.md,.png,.jpg,.jpeg,.gif,.svg"
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload files"
                    >
                        <Upload className="h-3 w-3" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Create file"
                        onClick={onCreateFile}
                    >
                        <FileText className="h-3 w-3" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Create folder"
                        onClick={onCreateFolder}
                    >
                        <Folder className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
