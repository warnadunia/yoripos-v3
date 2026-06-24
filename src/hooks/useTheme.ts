'use client';
import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState('emerald');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Load settings dari localStorage kalau ada
        const savedTheme = localStorage.getItem('theme') || 'emerald';
        const savedDark = localStorage.getItem('dark') === 'true';
        setTheme(savedTheme);
        setIsDark(savedDark);
        
        // Apply class
        document.documentElement.className = `${savedDark ? 'dark' : ''} theme-${savedTheme}`;
    }, []);

    const changeTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.className = `${isDark ? 'dark' : ''} theme-${newTheme}`;
    };

    const toggleDark = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        localStorage.setItem('dark', String(newDark));
        document.documentElement.className = `${newDark ? 'dark' : ''} theme-${theme}`;
    };

    return { isDark, theme, toggleDark, changeTheme };
}