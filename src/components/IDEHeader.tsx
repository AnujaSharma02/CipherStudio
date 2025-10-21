'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle';
import { Save, Download, Upload } from 'lucide-react';

interface IDEHeaderProps {
    projectName: string;
    isSaving: boolean;
    autosave: boolean;
    onProjectNameChange: (name: string) => void;
    onProjectNameBlur: () => void;
    onSave: () => void;
    onLoadProject: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExportProject: () => void;
    onToggleAutosave: () => void;
}

export default function IDEHeader({
    projectName,
    isSaving,
    autosave,
    onProjectNameChange,
    onProjectNameBlur,
    onSave,
    onLoadProject,
    onExportProject,
    onToggleAutosave
}: IDEHeaderProps) {
    return (
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Input
                    value={projectName}
                    onChange={(e) => onProjectNameChange(e.target.value)}
                    onBlur={onProjectNameBlur}
                    className="w-48 h-8 text-sm hidden sm:block bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                />
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSave}
                    className="h-8"
                    disabled={isSaving}
                >
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8">
                            <Upload className="h-4 w-4 mr-1" />
                            Load
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Load Project</DialogTitle>
                        </DialogHeader>
                        <input
                            type="file"
                            accept=".json"
                            onChange={onLoadProject}
                            className="w-full"
                        />
                    </DialogContent>
                </Dialog>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onExportProject}
                    className="h-8"
                >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                </Button>

                <ThemeToggle />

                <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-muted-foreground">Autosave</span>
                    <Switch
                        checked={autosave}
                        onCheckedChange={onToggleAutosave}
                    />
                </div>
            </div>
        </header>
    );
}
