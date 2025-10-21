export interface ProjectFile {
    id: string;
    name: string;
    content: string;
    language: string;
    path: string;
    isDirectory?: boolean;
    children?: ProjectFile[];
    parentId?: string;
    isOpen?: boolean;
    isHidden?: boolean;
    lastModified?: string;
    size?: number;
}

export interface Project {
    id: string;
    name: string;
    files: ProjectFile[];
    createdAt: string;
    updatedAt: string;
}

export interface EditorState {
    activeFile: string | null;
    openFiles: string[];
    autosave: boolean;
}

export interface FileExplorerProps {
    files: ProjectFile[];
    activeFile: string | null;
    onFileSelect: (fileId: string) => void;
    onFileCreate: (name: string, isDirectory?: boolean, parentId?: string) => void;
    onFileDelete: (fileId: string) => void;
    onFileRename: (fileId: string, newName: string) => void;
    onFileMove: (fileId: string, newParentId: string | null) => void;
    onFileCopy: (fileId: string, newParentId: string | null) => void;
    onFolderToggle: (folderId: string) => void;
    onFileUpload: (files: File[], parentId?: string) => void;
}

export interface CodeEditorProps {
    file: ProjectFile | null;
    onChange: (content: string) => void;
}

export interface PreviewProps {
    files: ProjectFile[];
    activeFile: string | null;
}


export interface DragDropState {
    draggedFile: ProjectFile | null;
    dropTarget: string | null;
    isDragging: boolean;
}

export interface ApiFile {
    _id: string;
    name: string;
    content?: string;
    path?: string;
    type: string;
    children?: ApiFile[];
    parentId?: string;
    updatedAt: string;
    size: number;
}

export interface TransformedFile {
    id: string;
    name: string;
    content: string;
    language: string;
    path: string;
    type: string;
    isDirectory?: boolean;
    children?: TransformedFile[];
    parentId?: string;
    isOpen?: boolean;
    lastModified?: string;
    updatedAt: string;
    size?: number;
}
