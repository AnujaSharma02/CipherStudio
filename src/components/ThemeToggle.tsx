'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="secondary" size="sm" className="h-8">
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="h-8"
        >
            {theme === 'light' ? (
                <Moon className="h-4 w-4" />
            ) : (
                <Sun className="h-4 w-4" />
            )}
        </Button>
    );
}
