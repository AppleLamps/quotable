/**
 * Utility functions for common operations
 */

/**
 * Generate a unique ID
 * @returns {string} A unique identifier
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format a date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`;
        }
        return `${diffHours}h ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy text', 'error');
    }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {'success'|'error'|'info'} type - The type of toast
 */
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: 'var(--radius)',
        color: 'white',
        fontSize: '0.875rem',
        zIndex: '1001',
        maxWidth: '300px',
        boxShadow: 'var(--shadow-lg)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            toast.style.backgroundColor = 'hsl(142.1 76.2% 36.3%)';
            break;
        case 'error':
            toast.style.backgroundColor = 'hsl(var(--destructive))';
            break;
        default:
            toast.style.backgroundColor = 'hsl(var(--primary))';
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * Debounce function calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validate if a string is a valid OpenRouter API key
 * @param {string} key - The API key to validate
 * @returns {boolean} Whether the key is valid
 */
export function isValidApiKey(key) {
    return typeof key === 'string' && key.length > 20 && key.startsWith('sk-or-');
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized string
 */
export function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Escape special regex characters
 * @param {string} string - The string to escape
 * @returns {string} The escaped string
 */
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if the device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Get a random element from an array
 * @param {Array} array - The array to pick from
 * @returns {*} A random element
 */
export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Truncate text to a maximum length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated text
 */
export function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create a deep clone of an object
 * @param {Object} obj - The object to clone
 * @returns {Object} The cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if an object is empty
 * @param {Object} obj - The object to check
 * @returns {boolean} True if empty
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Get the current timestamp
 * @returns {number} Current timestamp
 */
export function getCurrentTimestamp() {
    return Date.now();
}

/**
 * Convert a string to kebab-case
 * @param {string} str - The string to convert
 * @returns {string} The kebab-cased string
 */
export function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Convert a string to Title Case
 * @param {string} str - The string to convert
 * @returns {string} The title-cased string
 */
export function toTitleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
