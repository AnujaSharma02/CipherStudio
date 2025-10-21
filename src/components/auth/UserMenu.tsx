'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';

export const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
