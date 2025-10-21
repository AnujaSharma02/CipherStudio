'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader
} from '@/components/ui/sidebar';
import { useProject } from '@/contexts/ProjectContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { Plus, Folder, Search } from 'lucide-react';

export const ProjectManager: React.FC = () => {
    const { projects, currentProject, createProject, loadProjects, selectProject, isLoading } = useProject();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        const result = await createProject(newProjectName.trim(), newProjectDescription.trim());
        if (result.success) {
            setNewProjectName('');
            setNewProjectDescription('');
            setIsCreateDialogOpen(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        loadProjects(1, 10, query);
    };

    return (
        <Sidebar>
            <SidebarHeader className='bg-background'>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-blue-500">CipherStudio</h1>
                    </div>
                    <UserMenu />
                </div>
            </SidebarHeader>
            <SidebarContent className='bg-background'>
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Projects</h2>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-8">
                                    <Plus className="h-4 w-4 mr-1" />
                                    New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Project</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateProject} className="space-y-4">
                                    <div>
                                        <label htmlFor="projectName" className="block text-sm font-medium text-foreground mb-1">
                                            Project Name
                                        </label>
                                        <Input
                                            id="projectName"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            placeholder="Enter project name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="projectDescription" className="block text-sm font-medium text-foreground mb-1">
                                            Description (Optional)
                                        </label>
                                        <Input
                                            id="projectDescription"
                                            value={newProjectDescription}
                                            onChange={(e) => setNewProjectDescription(e.target.value)}
                                            placeholder="Enter project description"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreateDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Creating...' : 'Create Project'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {projects.length === 0 ? (
                        <div className="text-center py-8">
                            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No projects yet</p>
                            <p className="text-sm text-muted-foreground">Create your first project to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {projects.map((project) => (
                                <div
                                    key={project._id}
                                    onClick={() => selectProject(project)}
                                    className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${currentProject?._id === project._id
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                        : 'border-border'
                                        }`}
                                >
                                    <h3 className="font-medium text-foreground">{project.name}</h3>
                                    {project.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                        </span>
                                        {project.isPublic && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Public
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SidebarContent>
        </Sidebar>
    );
};
