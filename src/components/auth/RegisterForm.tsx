'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
    onClose?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onClose }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        const result = await register(username, email, password);

        if (result.success) {
            onClose?.();
        } else {
            setError(result.error || 'Registration failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                <p className="text-muted-foreground">Join CipherStudio and start coding</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                        Username
                    </label>
                    <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        required
                        className="w-full"
                    />
                </div>

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
                        placeholder="Create a password"
                        required
                        className="w-full"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                        Confirm Password
                    </label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className="w-full"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};
