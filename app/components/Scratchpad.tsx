'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const CONFIG = {
    STORAGE_KEY: 'scratchpad_notes',
    AUTOSAVE_DELAY: 500, // ms
    SAVE_STATUS_DISPLAY_DURATION: 2000, // ms
    THEME_KEY: 'scratchpad_theme'
};

export default function Scratchpad() {
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'default' | 'saving' | 'saved' | 'error'>('default');
    const [showError, setShowError] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial Load & Theme
    useEffect(() => {
        // Theme
        const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
        const initialDark = savedTheme === 'dark';
        setIsDark(initialDark);
        updateThemeBody(initialDark);

        // Content
        if (isLocalStorageAvailable()) {
            const savedNotes = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (savedNotes !== null) {
                setContent(savedNotes);
            }
        } else {
            setShowError(true);
        }
        setIsLoaded(true);
    }, []);

    // Helper: Update Body Class
    const updateThemeBody = (dark: boolean) => {
        if (dark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Toggle Theme
    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        updateThemeBody(newDark);
        localStorage.setItem(CONFIG.THEME_KEY, newDark ? 'dark' : 'light');
    };

    // Check Storage Availability
    const isLocalStorageAvailable = () => {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    };

    // Save Logic
    const saveNotes = useCallback(async (text: string) => {
        if (!isLocalStorageAvailable()) {
            setStatus('error');
            setShowError(true);
            return;
        }

        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, text);
            setStatus('saved');

            // Reset status after delay
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = setTimeout(() => {
                setStatus('default');
            }, CONFIG.SAVE_STATUS_DISPLAY_DURATION);
        } catch (e: any) {
            console.error('Error saving to localStorage:', e);
            setStatus('error');
            if (e.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Your notes are too large.');
            }
        }
    }, []);

    // Handle Input
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        setStatus('saving');

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveNotes(newContent);
        }, CONFIG.AUTOSAVE_DELAY);
    };

    // Handle Storage Event (Multi-tab)
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === CONFIG.STORAGE_KEY && e.newValue !== content) {
                setContent(e.newValue || '');
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [content]);

    // Save on Unmount/VisibilityChange
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveNotes(content);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Beforeunload is tricky in React effects but good to have
        const handleBeforeUnload = () => {
            if (saveTimeoutRef.current) {
                saveNotes(content);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [content, saveNotes]);


    // Determine Status Text/Class
    const getStatusText = () => {
        switch (status) {
            case 'saving': return 'Saving...';
            case 'saved': return 'Saved';
            case 'error': return 'Error';
            default: return 'Auto-save on';
        }
    };

    if (!isLoaded) return null; // Prevent hydration mismatch

    return (
        <div className="container">
            <header className="header">
                <h1 className="title">Scratchpad</h1>
                <div className="header-controls">
                    <div className={`save-indicator ${status !== 'default' ? status : ''}`} id="saveIndicator">
                        <span className="save-status">{getStatusText()}</span>
                    </div>
                    <button
                        id="themeToggle"
                        className="theme-toggle"
                        aria-label="Toggle theme"
                        onClick={toggleTheme}
                    >
                        {/* Sun Icon */}
                        <svg
                            className="icon-sun"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ display: isDark ? 'none' : 'block' }}
                        >
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        {/* Moon Icon */}
                        <svg
                            className="icon-moon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ display: isDark ? 'block' : 'none' }}
                        >
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                </div>
            </header>

            <main className="main-content">
                <textarea
                    ref={textareaRef}
                    id="notepad"
                    className="notepad"
                    placeholder="Start typing... your notes auto-save ✨"
                    aria-label="Note-taking area"
                    spellCheck="true"
                    value={content}
                    onChange={handleInput}
                ></textarea>
            </main>

            {showError && (
                <div className="error-modal" id="errorModal">
                    <div className="error-content">
                        <h2>localStorage Unavailable</h2>
                        <p>This app requires browser storage to save your notes. Please ensure localStorage is enabled in your browser settings.</p>
                        <button
                            id="closeError"
                            className="error-button"
                            onClick={() => setShowError(false)}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
