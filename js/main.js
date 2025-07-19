/**
 * Main application logic and UI handlers
 */

import { Storage } from './storage.js';
import { apiClient } from './api.js';
import { generateId, formatDate, copyToClipboard, showToast, isValidApiKey } from './utils.js';
import { initializeIcons, updateActionIcons } from './icons.js';

/**
 * Main application class
 */
class QuoteScribeApp {
    constructor() {
        this.currentSection = 'add-quote';
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('🚀 App initialization started');
        this.bindEvents();
        console.log('📎 Events bound');
        this.loadTheme();
        console.log('🎨 Theme loaded');
        this.checkApiKey();
        console.log('🔑 API key checked');
        this.loadQuotes();
        console.log('📚 Initial quotes loaded');
        this.loadFavorites();
        console.log('⭐ Favorites loaded');
        this.loadReflections();
        console.log('💭 Reflections loaded');
        this.updateQuoteSelect();
        console.log('🔄 Quote select updated');
        
        // Initialize icons after content is loaded
        setTimeout(() => {
            console.log('🎨 Initializing icons...');
            initializeIcons();
        }, 100);
        console.log('✅ App initialization complete');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Quote actions
        document.getElementById('generate-quote')?.addEventListener('click', () => this.generateQuote());
        document.getElementById('save-quote')?.addEventListener('click', () => this.saveQuote());
        
        // Settings
        document.getElementById('save-api-key')?.addEventListener('click', () => this.saveApiKey());
        document.getElementById('test-api-key')?.addEventListener('click', () => this.testApiKey());
        document.getElementById('delete-api-key')?.addEventListener('click', () => this.deleteApiKey());
        
        // Theme switching
        document.querySelectorAll('input[name="theme"]').forEach(input => {
            input.addEventListener('change', (e) => this.handleThemeChange(e.target.value));
        });

        // Reflection
        document.getElementById('save-reflection')?.addEventListener('click', () => this.saveReflection());
        document.getElementById('reflection-quote-select')?.addEventListener('change', (e) => this.handleQuoteSelect(e));

        // Handle quote action buttons (copy, favorite, delete)
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (button) {
                const action = button.getAttribute('data-action');
                const quoteId = button.getAttribute('data-id');
                
                if (action && quoteId) {
                    switch (action) {
                        case 'copy':
                            this.copyQuote(quoteId);
                            break;
                        case 'favorite':
                            this.toggleFavorite(quoteId);
                            break;
                        case 'delete':
                            this.deleteQuote(quoteId);
                            break;
                    }
                }
                return;
            }

            // Close sidebar when clicking outside on mobile
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const toggle = document.getElementById('sidebar-toggle');
                if (sidebar && sidebar.classList.contains('active') && 
                    !sidebar.contains(e.target) && !toggle?.contains(e.target)) {
                    this.toggleSidebar();
                }
            }
        });
    }

    /**
     * Handle navigation between sections
     * @param {Event} e - The click event
     */
    handleNavigation(e) {
        const targetSection = e.currentTarget.dataset.section;
        this.switchSection(targetSection);
    }

    /**
     * Switch between content sections
     * @param {string} sectionId - The target section ID
     */
    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId)?.classList.add('active');

        this.currentSection = sectionId;

        // Load section-specific data
        switch (sectionId) {
            case 'favorites':
                this.loadFavorites();
                break;
            case 'reflect':
                this.updateQuoteSelect();
                this.loadReflections();
                break;
            case 'settings':
                this.loadApiKey();
                this.loadTheme();
                break;
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }
    }

    /**
     * Toggle sidebar visibility on mobile
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('active');
    }

    /**
     * Check if API key exists and prompt if not
     */
    checkApiKey() {
        if (!Storage.hasApiKey()) {
            setTimeout(() => {
                showToast('Please set your OpenRouter API key in Settings to generate quotes', 'info');
            }, 1000);
        }
    }

    /**
     * Load API key into settings
     */
    loadApiKey() {
        const apiKey = Storage.getApiKey();
        const input = document.getElementById('api-key-input');
        if (input) {
            input.value = apiKey;
        }
    }

    /**
     * Save API key
     */
    async saveApiKey() {
        const input = document.getElementById('api-key-input');
        const key = input?.value.trim();

        if (!key) {
            showToast('Please enter an API key', 'error');
            return;
        }

        if (!isValidApiKey(key)) {
            showToast('Please enter a valid OpenRouter API key (starts with sk-or-)', 'error');
            return;
        }

        try {
            apiClient.setApiKey(key);
            await apiClient.validateApiKey();
            
            Storage.setApiKey(key);
            this.updateApiStatus('API key saved successfully', 'success');
            showToast('API key saved successfully', 'success');
        } catch (error) {
            this.updateApiStatus(error.message, 'error');
            showToast(error.message, 'error');
        }
    }

    /**
     * Test API key
     */
    async testApiKey() {
        const key = Storage.getApiKey();
        if (!key) {
            showToast('Please save an API key first', 'error');
            return;
        }

        try {
            apiClient.setApiKey(key);
            await apiClient.validateApiKey();
            this.updateApiStatus('API key is valid', 'success');
            showToast('API key is valid', 'success');
        } catch (error) {
            this.updateApiStatus(error.message, 'error');
            showToast(error.message, 'error');
        }
    }

    /**
     * Delete API key
     */
    deleteApiKey() {
        if (confirm('Are you sure you want to delete your API key?')) {
            Storage.removeApiKey();
            apiClient.setApiKey('');
            document.getElementById('api-key-input').value = '';
            this.updateApiStatus('API key deleted', 'info');
            showToast('API key deleted', 'success');
        }
    }

    /**
     * Update API status display
     * @param {string} message - The status message
     * @param {string} type - The status type
     */
    updateApiStatus(message, type) {
        const statusDiv = document.getElementById('api-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `api-status ${type}`;
        }
    }

    /**
     * Generate a new quote using AI
     */
    async generateQuote() {
        console.log('🎯 generateQuote() called');
        const button = document.getElementById('generate-quote');
        const loadingOverlay = document.getElementById('loading-overlay');

        console.log('🔑 Checking API key...', Storage.hasApiKey());
        if (!Storage.hasApiKey()) {
            console.log('❌ No API key found');
            showToast('Please set your OpenRouter API key in Settings', 'error');
            return;
        }

        try {
            console.log('🚀 Starting quote generation...');
            button.disabled = true;
            loadingOverlay.classList.add('active');

            console.log('📡 Calling API...');
            const quote = await apiClient.generateQuote();
            console.log('✅ Quote received:', quote);
            
            const quoteInput = document.getElementById('quote-input');
            console.log('📝 Quote input element:', quoteInput);
            
            if (quoteInput) {
                quoteInput.value = quote;
                console.log('✅ Quote set in input field');
            } else {
                console.error('❌ Quote input element not found!');
            }
            
            showToast('Quote generated successfully', 'success');
        } catch (error) {
            console.error('❌ Error generating quote:', error);
            const errorMessage = error.message;
            showToast(errorMessage, 'error');
        } finally {
            console.log('🏁 Cleaning up...');
            button.disabled = false;
            loadingOverlay.classList.remove('active');
        }
    }

    /**
     * Save a quote
     */
    saveQuote() {
        console.log('💾 saveQuote() called');
        const input = document.getElementById('quote-input');
        console.log('📝 Quote input element:', input);
        const text = input?.value.trim();
        console.log('📄 Quote text:', text);

        if (!text) {
            console.log('❌ No text to save');
            showToast('Please enter a quote', 'error');
            return;
        }

        const quote = {
            id: generateId(),
            text,
            createdAt: new Date().toISOString(),
            isFavorite: false
        };
        console.log('📋 Quote object created:', quote);

        Storage.saveQuote(quote);
        console.log('✅ Quote saved to storage');
        
        input.value = '';
        console.log('🧹 Input cleared');
        
        this.loadQuotes();
        console.log('🔄 loadQuotes() called');
        
        showToast('Quote saved', 'success');
    }

    /**
     * Load and display quotes
     */
    loadQuotes() {
        console.log('📚 loadQuotes() called');
        const quotes = Storage.getQuotes();
        console.log('📊 Quotes from storage:', quotes);
        console.log('📈 Number of quotes:', quotes.length);
        this.displayQuotes(quotes);
        console.log('🖼️ displayQuotes() called');
    }

    /**
     * Load and display favorites
     */
    loadFavorites() {
        const favorites = Storage.getFavoriteQuotes();
        const container = document.getElementById('favorites-container');
        
        if (!container) return;

        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" data-icon="heart"></div>
                    <h3>No Favorites Yet</h3>
                    <p>Start building your collection of inspiring quotes by clicking the ⭐ icon on any quote that speaks to you</p>
                    <button class="btn btn-primary" onclick="app.switchSection('add-quote')">
                        <span class="btn-icon" data-icon="add"></span>
                        Find Quotes to Love
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = favorites.map(quote => this.renderQuote(quote)).join('');
    }

    /**
     * Load and display reflections
     */
    loadReflections() {
        const reflections = Storage.getReflections();
        const container = document.getElementById('reflections-container');
        
        if (!container) return;

        if (reflections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" data-icon="thoughts"></div>
                    <h3>No Reflections Yet</h3>
                    <p>Transform quotes into wisdom by writing your thoughts and insights about them</p>
                    <button class="btn btn-primary" onclick="document.getElementById('reflection-quote-select').focus()">
                        <span class="btn-icon" data-icon="reflect"></span>
                        Start Reflecting
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = reflections.map(reflection => this.renderReflection(reflection)).join('');
    }

    /**
     * Update quote select dropdown for reflections
     */
    updateQuoteSelect() {
        const select = document.getElementById('reflection-quote-select');
        if (!select) return;

        const quotes = Storage.getQuotes();
        select.innerHTML = '<option value="">Select a quote...</option>';
        
        quotes.forEach(quote => {
            const option = document.createElement('option');
            option.value = quote.id;
            option.textContent = quote.text.substring(0, 50) + (quote.text.length > 50 ? '...' : '');
            select.appendChild(option);
        });
    }

    /**
     * Handle quote selection for reflection
     * @param {Event} e - The change event
     */
    handleQuoteSelect(e) {
        const quoteId = e.target.value;
        const display = document.getElementById('selected-quote-display');
        
        if (!quoteId) {
            display.innerHTML = '';
            return;
        }

        const quotes = Storage.getQuotes();
        const quote = quotes.find(q => q.id === quoteId);
        
        if (quote) {
            display.innerHTML = `<blockquote>${quote.text}</blockquote>`;
        }
    }

    /**
     * Save a reflection
     */
    saveReflection() {
        const quoteSelect = document.getElementById('reflection-quote-select');
        const reflectionText = document.getElementById('reflection-text');
        
        const quoteId = quoteSelect?.value;
        const text = reflectionText?.value.trim();

        if (!quoteId) {
            showToast('Please select a quote to reflect on', 'error');
            return;
        }

        if (!text) {
            showToast('Please enter your reflection', 'error');
            return;
        }

        const reflection = {
            id: generateId(),
            quoteId,
            text,
            createdAt: new Date().toISOString()
        };

        Storage.saveReflection(reflection);
        reflectionText.value = '';
        quoteSelect.value = '';
        document.getElementById('selected-quote-display').innerHTML = '';
        
        this.loadReflections();
        showToast('Reflection saved', 'success');
    }

    /**
     * Render a quote card
     * @param {Object} quote - The quote object
     * @returns {string} HTML string
     */
    renderQuote(quote) {
        const isFavorite = Storage.isFavorite(quote.id);
        const date = formatDate(new Date(quote.createdAt));
        
        return `
            <div class="quote-card" data-id="${quote.id}">
                <div class="quote-text">${quote.text}</div>
                <div class="quote-meta">
                    <span>${date}</span>
                    <div class="quote-actions">
                        <button onclick="app.copyQuote('${quote.id}')" title="Copy">📋</button>
                        <button onclick="app.toggleFavorite('${quote.id}')" title="${isFavorite ? 'Remove from' : 'Add to'} favorites">
                            ${isFavorite ? '⭐' : '☆'}
                        </button>
                        <button onclick="app.deleteQuote('${quote.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render a reflection card
     * @param {Object} reflection - The reflection object
     * @returns {string} HTML string
     */
    renderReflection(reflection) {
        const quotes = Storage.getQuotes();
        const quote = quotes.find(q => q.id === reflection.quoteId);
        const date = formatDate(new Date(reflection.createdAt));
        
        return `
            <div class="reflection-card" data-id="${reflection.id}">
                <div class="reflection-text">${reflection.text}</div>
                ${quote ? `<blockquote>${quote.text}</blockquote>` : ''}
                <div class="quote-meta">
                    <span>${date}</span>
                    <div class="quote-actions">
                        <button onclick="app.deleteReflection('${reflection.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Copy a quote to clipboard
     * @param {string} quoteId - The quote ID
     */
    async copyQuote(quoteId) {
        const quotes = Storage.getQuotes();
        const quote = quotes.find(q => q.id === quoteId);
        
        if (quote) {
            await copyToClipboard(`"${quote.text}"`);
        }
    }

    /**
     * Toggle favorite status
     * @param {string} quoteId - The quote ID
     */
    toggleFavorite(quoteId) {
        const isFavorite = Storage.isFavorite(quoteId);
        
        if (isFavorite) {
            Storage.removeFromFavorites(quoteId);
            showToast('Removed from favorites', 'success');
        } else {
            Storage.addToFavorites(quoteId);
            showToast('Added to favorites', 'success');
        }
        
        this.loadQuotes();
        if (this.currentSection === 'favorites') {
            this.loadFavorites();
        }
    }

    /**
     * Delete a quote
     * @param {string} quoteId - The quote ID
     */
    deleteQuote(quoteId) {
        if (confirm('Are you sure you want to delete this quote?')) {
            Storage.deleteQuote(quoteId);
            Storage.removeFromFavorites(quoteId);
            this.loadQuotes();
            this.updateQuoteSelect();
            
            if (this.currentSection === 'favorites') {
                this.loadFavorites();
            }
            showToast('Quote deleted', 'success');
        }
    }

    /**
     * Delete a reflection
     * @param {string} reflectionId - The reflection ID
     */
    deleteReflection(reflectionId) {
        if (confirm('Are you sure you want to delete this reflection?')) {
            Storage.deleteReflection(reflectionId);
            this.loadReflections();
            showToast('Reflection deleted', 'success');
        }
    }

    /**
     * Display quotes in the container
     */
    displayQuotes(quotes, containerId = 'quotes-container') {
        console.log('🖼️ displayQuotes() called with:', quotes.length, 'quotes for container:', containerId);
        const container = document.getElementById(containerId);
        console.log('📦 Container element:', container);
        
        if (!container) {
            console.error('❌ Container not found:', containerId);
            return;
        }

        if (quotes.length === 0) {
            console.log('📭 No quotes to display, showing empty state');
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon" data-icon="lightbulb"></div>
                    <h3>Ready to Begin?</h3>
                    <p>Create your first quote by generating one with AI or writing your own inspiring words</p>
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="document.getElementById('generate-quote').click()">
                            <span class="btn-icon" data-icon="generate"></span>
                            Generate Quote
                        </button>
                        <button class="btn btn-secondary" onclick="document.getElementById('quote-input').focus()">
                            <span class="btn-icon" data-icon="add"></span>
                            Write Quote
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        console.log('🎨 Rendering', quotes.length, 'quotes...');
        container.innerHTML = quotes.map(quote => {
            const isFavorite = Storage.isFavorite(quote.id);
            return `
                <div class="quote-card" data-id="${quote.id}">
                    <div class="quote-text">${quote.text}</div>
                    <div class="quote-meta">
                        <span class="quote-date">${formatDate(new Date(quote.createdAt))}</span>
                        <div class="quote-actions">
                            <button data-action="copy" data-id="${quote.id}" title="Copy quote"></button>
                            <button data-action="favorite" data-id="${quote.id}" class="${isFavorite ? 'favorited' : ''}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"></button>
                            <button data-action="delete" data-id="${quote.id}" class="delete" title="Delete quote"></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        console.log('✅ Quotes rendered to container');
        console.log('🎭 Container HTML length:', container.innerHTML.length);

        // Update action icons after adding new content
        setTimeout(() => {
            console.log('🔄 Updating action icons...');
            updateActionIcons();
        }, 50);
    }

    /**
     * Handle theme change
     * @param {string} theme - The selected theme (light, dark, auto)
     */
    handleThemeChange(theme) {
        console.log('🎨 Theme changed to:', theme);
        this.setTheme(theme);
        Storage.setItem('quote_scribe_theme', theme);
    }

    /**
     * Set the application theme
     * @param {string} theme - The theme to apply (light, dark, auto)
     */
    setTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark');
        
        switch (theme) {
            case 'light':
                body.classList.add('theme-light');
                break;
            case 'dark':
                body.classList.add('theme-dark');
                break;
            case 'auto':
            default:
                // Let CSS media queries handle auto mode
                break;
        }
    }

    /**
     * Load saved theme preference
     */
    loadTheme() {
        const savedTheme = Storage.getItem('quote_scribe_theme') || 'auto';
        
        // Set the radio button
        const themeInput = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
        if (themeInput) {
            themeInput.checked = true;
        }
        
        // Apply the theme
        this.setTheme(savedTheme);
    }
}

// Initialize the app
const app = new QuoteScribeApp();

// Make app globally available for onclick handlers
window.app = app;

// Handle window resize
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768 && sidebar?.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});
