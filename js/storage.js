/**
 * Storage management for localStorage operations
 */

const STORAGE_KEYS = {
    API_KEY: 'quote_scribe_api_key',
    QUOTES: 'quote_scribe_quotes',
    FAVORITES: 'quote_scribe_favorites',
    REFLECTIONS: 'quote_scribe_reflections'
};

/**
 * Storage class for managing localStorage operations
 */
export class Storage {
    /**
     * Save an item to localStorage
     * @param {string} key - The storage key
     * @param {*} value - The value to store
     */
    static setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Get an item from localStorage
     * @param {string} key - The storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} The stored value or default value
     */
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove an item from localStorage
     * @param {string} key - The storage key
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    /**
     * Clear all storage related to the app
     */
    static clearAll() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * API Key management
     */
    static getApiKey() {
        return this.getItem(STORAGE_KEYS.API_KEY, '');
    }

    static setApiKey(key) {
        return this.setItem(STORAGE_KEYS.API_KEY, key);
    }

    static removeApiKey() {
        return this.removeItem(STORAGE_KEYS.API_KEY);
    }

    static hasApiKey() {
        const key = this.getApiKey();
        return key && key.length > 0;
    }

    /**
     * Quote management
     */
    static saveQuote(quote) {
        console.log('💽 Storage.saveQuote() called with:', quote);
        const quotes = this.getQuotes();
        console.log('📚 Current quotes before save:', quotes.length);
        quotes.unshift(quote);
        console.log('📚 Quotes after adding new one:', quotes.length);
        const result = this.setItem(STORAGE_KEYS.QUOTES, quotes);
        console.log('💾 Save result:', result);
        
        // Verify the save worked
        const savedQuotes = this.getQuotes();
        console.log('✅ Verification - quotes after save:', savedQuotes.length);
        return result;
    }

    static getQuotes() {
        const quotes = this.getItem(STORAGE_KEYS.QUOTES, []);
        console.log('📖 Storage.getQuotes() returning:', quotes.length, 'quotes');
        return quotes;
    }

    static updateQuote(id, updates) {
        const quotes = this.getQuotes();
        const index = quotes.findIndex(q => q.id === id);
        if (index !== -1) {
            quotes[index] = { ...quotes[index], ...updates };
            return this.setItem(STORAGE_KEYS.QUOTES, quotes);
        }
        return false;
    }

    static deleteQuote(id) {
        const quotes = this.getQuotes();
        const filteredQuotes = quotes.filter(q => q.id !== id);
        return this.setItem(STORAGE_KEYS.QUOTES, filteredQuotes);
    }

    /**
     * Favorites management
     */
    static addToFavorites(quoteId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(quoteId)) {
            favorites.push(quoteId);
            return this.setItem(STORAGE_KEYS.FAVORITES, favorites);
        }
        return true;
    }

    static removeFromFavorites(quoteId) {
        const favorites = this.getFavorites();
        const filteredFavorites = favorites.filter(id => id !== quoteId);
        return this.setItem(STORAGE_KEYS.FAVORITES, filteredFavorites);
    }

    static getFavorites() {
        return this.getItem(STORAGE_KEYS.FAVORITES, []);
    }

    static isFavorite(quoteId) {
        const favorites = this.getFavorites();
        return favorites.includes(quoteId);
    }

    static getFavoriteQuotes() {
        const quotes = this.getQuotes();
        const favorites = this.getFavorites();
        return quotes.filter(quote => favorites.includes(quote.id));
    }

    /**
     * Reflection management
     */
    static saveReflection(reflection) {
        const reflections = this.getReflections();
        reflections.unshift(reflection);
        return this.setItem(STORAGE_KEYS.REFLECTIONS, reflections);
    }

    static getReflections() {
        return this.getItem(STORAGE_KEYS.REFLECTIONS, []);
    }

    static updateReflection(id, updates) {
        const reflections = this.getReflections();
        const index = reflections.findIndex(r => r.id === id);
        if (index !== -1) {
            reflections[index] = { ...reflections[index], ...updates };
            return this.setItem(STORAGE_KEYS.REFLECTIONS, reflections);
        }
        return false;
    }

    static deleteReflection(id) {
        const reflections = this.getReflections();
        const filteredReflections = reflections.filter(r => r.id !== id);
        return this.setItem(STORAGE_KEYS.REFLECTIONS, filteredReflections);
    }

    static getReflectionsForQuote(quoteId) {
        const reflections = this.getReflections();
        return reflections.filter(r => r.quoteId === quoteId);
    }

    /**
     * Get storage statistics
     * @returns {Object} Storage usage statistics
     */
    static getStats() {
        const quotes = this.getQuotes();
        const favorites = this.getFavorites();
        const reflections = this.getReflections();
        
        return {
            totalQuotes: quotes.length,
            totalFavorites: favorites.length,
            totalReflections: reflections.length,
            hasApiKey: this.hasApiKey()
        };
    }

    /**
     * Export all data as JSON
     * @returns {Object} All stored data
     */
    static exportData() {
        return {
            apiKey: this.hasApiKey() ? '***' : null,
            quotes: this.getQuotes(),
            favorites: this.getFavorites(),
            reflections: this.getReflections(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import data from JSON
     * @param {Object} data - The data to import
     * @returns {boolean} Success status
     */
    static importData(data) {
        try {
            if (data.quotes) this.setItem(STORAGE_KEYS.QUOTES, data.quotes);
            if (data.favorites) this.setItem(STORAGE_KEYS.FAVORITES, data.favorites);
            if (data.reflections) this.setItem(STORAGE_KEYS.REFLECTIONS, data.reflections);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Export storage keys for use in other modules
export { STORAGE_KEYS };
