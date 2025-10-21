'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            onClose?.();
        } else {
            setError(result.error || 'Login failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to your CipherStudio account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};
