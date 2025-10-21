'use client';

import { Button } from '@/components/ui/button';
import { FileText, Folder, Code } from 'lucide-react';

interface WelcomeScreenProps {
    onCreateFile: (name: string) => void;
    onCreateFolder: (name: string) => void;
}

export default function WelcomeScreen({ onCreateFile, onCreateFolder }: WelcomeScreenProps) {
    const quickStartFiles = [
        { name: 'App.jsx', description: 'Main React component' },
        { name: 'index.js', description: 'Entry point' },
        { name: 'styles.css', description: 'Global styles' },
    ];

    return (
        <div className="h-full w-full flex items-center justify-center bg-neutral-50 dark:bg-black">
            <div className="max-w-2xl mx-auto text-center p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        Welcome to CipherStudio
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        Your browser-based React IDE. Create, edit, and preview React projects in real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <FileText className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Create Files</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            Start with React components, styles, or any file type you need.
                        </p>
                        <Button
                            onClick={() => onCreateFile('App.jsx')}
                            className="w-full"
                        >
                            Create App.jsx
                        </Button>
                    </div>

                    <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <Folder className="h-8 w-8 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Organize</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            Create folders to organize your project structure.
                        </p>
                        <Button
                            onClick={() => onCreateFolder('components')}
                            className="w-full bg-green-500"
                        >
                            Create Folder
                        </Button>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Quick Start Templates</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {quickStartFiles.map((file) => (
                            <Button
                                key={file.name}
                                variant="outline"
                                size="sm"
                                onClick={() => onCreateFile(file.name)}
                                className="text-xs"
                            >
                                <Code className="h-3 w-3 mr-1" />
                                {file.name}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    <p>💡 Use the file explorer to manage your project files</p>
                    <p>🚀 Changes appear in the preview panel automatically</p>
                </div>
            </div>
        </div>
    );
}
