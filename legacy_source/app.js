/**
 * Scratchpad Web App - Main Application Logic
 * Handles auto-save, auto-load, and localStorage persistence
 */

// Configuration
const CONFIG = {
    STORAGE_KEY: 'scratchpad_notes',
    AUTOSAVE_DELAY: 500, // ms
    SAVE_STATUS_DISPLAY_DURATION: 2000, // ms
    THEME_KEY: 'scratchpad_theme'
};

// DOM Elements
const notepad = document.getElementById('notepad');
const saveIndicator = document.getElementById('saveIndicator');
const saveStatus = document.getElementById('saveStatus');
const themeToggle = document.getElementById('themeToggle');
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');
const errorModal = document.getElementById('errorModal');
const closeErrorBtn = document.getElementById('closeError');

// State
let saveTimeout = null;
let statusTimeout = null;

/**
 * Check if localStorage is available and functional
 */
function isLocalStorageAvailable() {
    try {
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Show error modal
 */
function showError() {
    errorModal.style.display = 'flex';
}

/**
 * Hide error modal
 */
function hideError() {
    errorModal.style.display = 'none';
}

/**
 * Update save status indicator
 */
function updateSaveStatus(status) {
    // Clear previous status timeout
    if (statusTimeout) {
        clearTimeout(statusTimeout);
        statusTimeout = null;
    }

    // Remove all status classes
    saveIndicator.classList.remove('saving', 'saved', 'error');

    switch (status) {
        case 'saving':
            saveStatus.textContent = 'Saving...';
            saveIndicator.classList.add('saving');
            break;
        case 'saved':
            saveStatus.textContent = 'Saved';
            saveIndicator.classList.add('saved');
            // Reset to neutral state after a delay
            statusTimeout = setTimeout(() => {
                saveStatus.textContent = 'Auto-save on';
                saveIndicator.classList.remove('saved');
            }, CONFIG.SAVE_STATUS_DISPLAY_DURATION);
            break;
        case 'error':
            saveStatus.textContent = 'Error';
            saveIndicator.classList.add('error');
            break;
        default:
            saveStatus.textContent = 'Auto-save on';
    }
}

/**
 * Save notes to localStorage
 */
function saveNotes() {
    if (!isLocalStorageAvailable()) {
        updateSaveStatus('error');
        showError();
        return;
    }

    try {
        const content = notepad.value;
        localStorage.setItem(CONFIG.STORAGE_KEY, content);
        updateSaveStatus('saved');
    } catch (e) {
        console.error('Error saving to localStorage:', e);

        // Check if it's a quota exceeded error
        if (e.name === 'QuotaExceededError') {
            updateSaveStatus('error');
            alert('Storage quota exceeded. Your notes are too large. Consider clearing some content.');
        } else {
            updateSaveStatus('error');
        }
    }
}

/**
 * Load notes from localStorage
 */
function loadNotes() {
    if (!isLocalStorageAvailable()) {
        showError();
        return;
    }

    try {
        const savedNotes = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (savedNotes !== null) {
            notepad.value = savedNotes;
            updateSaveStatus('default');
        } else {
            updateSaveStatus('default');
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        updateSaveStatus('error');
    }
}

/**
 * Handle input with debounced auto-save
 */
function handleInput() {
    // Show saving status immediately
    updateSaveStatus('saving');

    // Clear existing timeout
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    // Set new timeout for debounced save
    saveTimeout = setTimeout(() => {
        saveNotes();
    }, CONFIG.AUTOSAVE_DELAY);
}

/**
 * Handle storage events (for multi-tab sync)
 * When localStorage is updated in another tab, sync the content
 */
function handleStorageEvent(e) {
    if (e.key === CONFIG.STORAGE_KEY) {
        // Only update if the value actually changed
        if (e.newValue !== notepad.value) {
            notepad.value = e.newValue || '';
        }
    }
}

/**
 * Set cursor to the end of the text
 */
function setCursorToEnd() {
    const length = notepad.value.length;
    notepad.setSelectionRange(length, length);
}

/**
 * Update Theme UI
 */
function updateThemeUI(isDark) {
    if (isDark) {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
        document.body.classList.add('dark-mode');
    } else {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
        document.body.classList.remove('dark-mode');
    }
}

/**
 * Handle Theme Toggle
 */
function handleThemeToggle() {
    const isDark = document.body.classList.contains('dark-mode');
    const newIsDark = !isDark;

    updateThemeUI(newIsDark);
    localStorage.setItem(CONFIG.THEME_KEY, newIsDark ? 'dark' : 'light');
}

/**
 * Initialize Theme
 */
function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
    // Default to light (Coda style) if not set
    const isDark = savedTheme === 'dark';
    updateThemeUI(isDark);
}

/**
 * Initialize the application
 */
function init() {
    // Initialize Theme
    initTheme();

    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
        showError();
        return;
    }

    // Load saved notes
    loadNotes();

    // Focus the textarea
    notepad.focus();

    // Set cursor to end of text
    setCursorToEnd();

    // Event Listeners
    notepad.addEventListener('input', handleInput);
    themeToggle.addEventListener('click', handleThemeToggle);

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageEvent);

    // Close error modal
    closeErrorBtn.addEventListener('click', hideError);

    // Save on page unload (backup in case debounce hasn't fired)
    window.addEventListener('beforeunload', () => {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveNotes();
        }
    });

    // Handle visibility change (save when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && saveTimeout) {
            clearTimeout(saveTimeout);
            saveNotes();
        }
    });
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose for debugging in development
if (typeof window !== 'undefined') {
    window.scratchpad = {
        saveNotes,
        loadNotes,
        clearNotes: () => {
            if (confirm('Are you sure you want to clear all notes?')) {
                notepad.value = '';
                saveNotes();
            }
        }
    };
}
