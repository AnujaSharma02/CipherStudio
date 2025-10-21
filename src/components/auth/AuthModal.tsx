'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

    useEffect(() => {
        setMode(defaultMode);
    }, [defaultMode]);

    const switchToLogin = () => setMode('login');
    const switchToRegister = () => setMode('register');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="sr-only">
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </DialogTitle>
                </DialogHeader>

                {mode === 'login' ? (
                    <LoginForm onSwitchToRegister={switchToRegister} onClose={onClose} />
                ) : (
                    <RegisterForm onSwitchToLogin={switchToLogin} onClose={onClose} />
                )}
            </DialogContent>
        </Dialog>
    );
};
