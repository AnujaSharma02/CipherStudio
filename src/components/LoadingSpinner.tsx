'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
                <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
                <p className="text-foreground font-medium">{message}</p>
            </div>
        </div>
    );
}
