'use client';

import { useRef } from 'react';
import { useTheme } from 'next-themes';
import Editor from '@monaco-editor/react';
import { CodeEditorProps } from '@/types';

const EDITOR_OPTIONS = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on' as const,
    fontLigatures: true,
    lineHeight: 1.5,
    cursorBlinking: 'smooth' as const,
};

const LANGUAGE_MAP: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
};

export default function CodeEditor({ file, onChange }: CodeEditorProps) {
    const { theme } = useTheme();
    const editorRef = useRef<unknown>(null);

    const handleEditorDidMount = (editor: unknown) => {
        editorRef.current = editor;
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onChange(value);
        }
    };

    const getLanguage = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        return LANGUAGE_MAP[extension || ''] || 'javascript';
    };

    if (!file) {
        return (
            <div className="h-full flex items-center justify-center bg-editor-bg">
                <div className="text-center text-muted-foreground">
                    <div className="text-lg font-medium mb-2">No file selected</div>
                    <div className="text-sm">Select a file from the explorer to start editing</div>
                </div>
            </div>
        );
    }

    const editorTheme = theme === 'dark' ? 'hc-black' : 'light';

    return (
        <div className="h-full bg-editor-bg relative">
            <div className="h-full">
                <Editor
                    height="100%"
                    language={getLanguage(file.name)}
                    value={file.content}
                    theme={editorTheme}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                    options={EDITOR_OPTIONS}
                />
            </div>
        </div>
    );
}