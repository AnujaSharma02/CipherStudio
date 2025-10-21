'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProjectManager } from '@/components/projects/ProjectManager';
import IDE from '@/components/IDE';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider
} from '@/components/ui/sidebar';
import { LogIn, User } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              CipherStudio
            </h1>
            <p className="text-lg text-muted-foreground">
              A powerful browser-based React IDE
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full"
              size="lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>

            <Button
              onClick={() => {
                setAuthMode('register');
                setIsAuthModalOpen(true);
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <User className="h-5 w-5 mr-2" />
              Create Account
            </Button>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode={authMode}
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ProjectManager />
      <main className="min-h-lvh w-full">
        <IDE />
      </main>
    </SidebarProvider>
  );
}
