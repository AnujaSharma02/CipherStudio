'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ProjectFile, DragDropState } from '@/types';
import {
    Folder,
    FolderOpen,
    MoreVertical,
    Edit,
    Trash2,
    FileText,
    Copy,
    Move,
    ChevronRight,
    ChevronDown,
    File,
    FileImage,
    FileCode,
    FileJson,
    FileType,
    FileCode2,
    FileText as FileMarkdown
} from 'lucide-react';

interface FileTreeProps {
    files: ProjectFile[];
    activeFile: string | null;
    onFileSelect: (fileId: string) => void;
    onFileDelete: (fileId: string) => void;
    onFileRename: (fileId: string, newName: string) => void;
    onFileMove: (fileId: string, newParentId: string | null) => void;
    onFileCopy: (fileId: string, newParentId: string | null) => void;
    onFolderToggle: (folderId: string) => void;
    onCreateFileInFolder?: (folderId: string) => void;
    onCreateFolderInFolder?: (folderId: string) => void;
    dragDropState: DragDropState;
    onDragStart: (e: React.DragEvent, file: ProjectFile) => void;
    onDragOver: (e: React.DragEvent, targetId: string) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, targetId: string) => void;
    onDragEnd: () => void;
}

export default function FileTree({
    files,
    activeFile,
    onFileSelect,
    onFileDelete,
    onFileRename,
    onFileMove,
    onFileCopy,
    onFolderToggle,
    onCreateFileInFolder,
    onCreateFolderInFolder,
    dragDropState,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd
}: FileTreeProps) {
    const [editingFile, setEditingFile] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [contextMenuOpen, setContextMenuOpen] = useState<string | null>(null);

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const iconMap: Record<string, React.ReactElement> = {
            'js': <FileCode className="h-4 w-4 text-blue-500" />,
            'jsx': <FileCode className="h-4 w-4 text-blue-500" />,
            'ts': <FileCode className="h-4 w-4 text-blue-500" />,
            'tsx': <FileCode className="h-4 w-4 text-blue-500" />,
            'css': <FileType className="h-4 w-4 text-pink-500" />,
            'html': <FileCode2 className="h-4 w-4 text-orange-500" />,
            'json': <FileJson className="h-4 w-4 text-yellow-500" />,
            'md': <FileMarkdown className="h-4 w-4 text-muted-foreground" />,
            'png': <FileImage className="h-4 w-4 text-green-500" />,
            'jpg': <FileImage className="h-4 w-4 text-green-500" />,
            'jpeg': <FileImage className="h-4 w-4 text-green-500" />,
            'gif': <FileImage className="h-4 w-4 text-green-500" />,
            'svg': <FileImage className="h-4 w-4 text-green-500" />,
        };
        return iconMap[extension || ''] || <File className="h-4 w-4 text-muted-foreground" />;
    };

    const buildFileTree = useCallback((files: ProjectFile[]): ProjectFile[] => {
        return files;
    }, []);

    const handleRename = (fileId: string, currentName: string) => {
        setEditingFile(fileId);
        setEditingName(currentName);
    };

    const handleRenameSubmit = () => {
        if (editingFile && editingName.trim()) {
            onFileRename(editingFile, editingName.trim());
            setEditingFile(null);
            setEditingName('');
        }
    };

    const handleRightClick = (e: React.MouseEvent, file: ProjectFile) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuOpen(file.id);
    };

    const renderFile = (file: ProjectFile, depth = 0) => {
        const isActive = activeFile === file.id;
        const isEditing = editingFile === file.id;
        const isDropTarget = dragDropState.dropTarget === file.id;
        const isDragged = dragDropState.draggedFile?.id === file.id;

        return (
            <div key={file.id} className="select-none">
                <div
                    className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-accent cursor-pointer group transition-colors ${isActive ? 'bg-accent text-accent-foreground' : ''
                        } ${isDropTarget ? 'bg-primary/10 border border-primary/20' : ''
                        } ${isDragged ? 'opacity-50' : ''
                        } ${file.isDirectory ? 'hover:shadow-sm' : ''
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => {
                        if (file.isDirectory) {
                            onFolderToggle(file.id);
                        } else {
                            onFileSelect(file.id);
                        }
                    }}
                    onContextMenu={(e) => handleRightClick(e, file)}
                    draggable
                    onDragStart={(e) => onDragStart(e, file)}
                    onDragOver={(e) => onDragOver(e, file.id)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, file.id)}
                    onDragEnd={onDragEnd}
                    title={file.isDirectory ? `Right-click to create files in ${file.name}` : 'Right-click for options'}
                >
                    {file.isDirectory && (
                        <div className="w-4 h-4 flex items-center justify-center">
                            {file.isOpen ? (
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            )}
                        </div>
                    )}

                    <div className="w-4 h-4 flex items-center justify-center">
                        {file.isDirectory ? (
                            file.isOpen ? (
                                <FolderOpen className="h-4 w-4 text-blue-500" />
                            ) : (
                                <Folder className="h-4 w-4 text-blue-500" />
                            )
                        ) : (
                            getFileIcon(file.name)
                        )}
                    </div>

                    {isEditing ? (
                        <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit();
                                if (e.key === 'Escape') {
                                    setEditingFile(null);
                                    setEditingName('');
                                }
                            }}
                            className="h-6 text-sm flex-1 bg-background text-foreground border-border placeholder:text-muted-foreground"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="text-sm flex-1 truncate text-foreground">{file.name}</span>
                    )}

                    <DropdownMenu open={contextMenuOpen === file.id} onOpenChange={(open) => !open && setContextMenuOpen(null)}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setContextMenuOpen(file.id);
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setContextMenuOpen(file.id);
                                }}
                            >
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {file.isDirectory && (onCreateFileInFolder || onCreateFolderInFolder) && (
                                <>
                                    {onCreateFileInFolder && (
                                        <DropdownMenuItem onClick={() => {
                                            onCreateFileInFolder(file.id);
                                            setContextMenuOpen(null);
                                        }}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Create File
                                        </DropdownMenuItem>
                                    )}
                                    {onCreateFolderInFolder && (
                                        <DropdownMenuItem onClick={() => {
                                            onCreateFolderInFolder(file.id);
                                            setContextMenuOpen(null);
                                        }}>
                                            <Folder className="h-4 w-4 mr-2" />
                                            Create Folder
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {!file.isDirectory && (
                                <>
                                    <DropdownMenuItem onClick={() => {
                                        onFileCopy(file.id, file.parentId || null);
                                        setContextMenuOpen(null);
                                    }}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        onFileMove(file.id, file.parentId || null);
                                        setContextMenuOpen(null);
                                    }}>
                                        <Move className="h-4 w-4 mr-2" />
                                        Move
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem onClick={() => {
                                handleRename(file.id, file.name);
                                setContextMenuOpen(null);
                            }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    onFileDelete(file.id);
                                    setContextMenuOpen(null);
                                }}
                                className="text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {file.isDirectory && file.isOpen && file.children && file.children.length > 0 && (
                    <div>
                        {file.children.map(child => renderFile(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const fileTree = buildFileTree(files);

    return (
        <div
            className="flex-1 overflow-y-auto p-2"
            onClick={() => setContextMenuOpen(null)}
        >
            {fileTree.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                    <div className="mb-4">
                        <Folder className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    </div>
                    <div className="mb-2 font-medium">No files yet</div>
                    <div className="text-xs">Create your first file or folder to get started!</div>
                </div>
            ) : (
                fileTree.map(file => renderFile(file))
            )}
        </div>
    );
}
