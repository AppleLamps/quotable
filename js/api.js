/**
 * API integration for OpenRouter
 */

import { Storage } from './storage.js';
import { showToast } from './utils.js';

const API_CONFIG = {
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'openai/chatgpt-4o-latest',
    headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Quote Scribe Reflect'
    }
};

/**
 * API client for OpenRouter
 */
export class ApiClient {
    constructor() {
        this.apiKey = Storage.getApiKey();
    }

    /**
     * Update the API key
     * @param {string} key - The new API key
     */
    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Make a request to the OpenRouter API
     * @param {string} endpoint - The API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} The response data
     */
    async makeRequest(endpoint, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        const url = `${API_CONFIG.baseUrl}${endpoint}`;
        const config = {
            method: 'POST',
            headers: {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${this.apiKey}`
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    /**
     * Generate a quote using OpenRouter API
     * @param {string} prompt - Custom prompt for quote generation
     * @returns {Promise<string>} The generated quote
     */
    async generateQuote(prompt = null) {
        const systemPrompt = `You are a profound philosopher with deep understanding of the human condition. Generate a powerful, impactful quote that cuts to the core of existence, truth, or human nature. The quote should be:
1. Profound and thought-provoking
2. Concise yet devastatingly impactful (1-3 sentences)
3. Original and authentic
4. Match the tone and emotional intensity of the request - whether moving, bold, harsh, melancholic, fierce, or contemplative`;

        const userPrompt = prompt || 'Generate an insightful quote about life, growth, or human nature.';

        const requestBody = {
            model: API_CONFIG.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 3000,
            temperature: 0.8,
            top_p: 0.9
        };

        try {
            console.log('📤 API Request Body:', requestBody);
            const response = await this.makeRequest('/chat/completions', {
                body: JSON.stringify(requestBody)
            });
            
            console.log('📥 Full API Response:', response);
            console.log('🎯 Response choices:', response.choices);
            console.log('🔍 First choice:', response.choices?.[0]);
            console.log('💬 Message object:', response.choices?.[0]?.message);
            console.log('📄 Message content:', response.choices?.[0]?.message?.content);
            console.log('❗ Response error:', response.error);
            console.log('⚠️ Response finish_reason:', response.choices?.[0]?.finish_reason);
            
            let quote = response.choices?.[0]?.message?.content?.trim();
            console.log('📝 Raw quote from API (content field):', quote);
            
            // Try alternative response structures for different models
            if (!quote) {
                console.log('🔄 Trying alternative response structures...');
                
                // Check for reasoning field (Gemini thinking models)
                quote = response.choices?.[0]?.message?.reasoning?.trim();
                console.log('📝 Alternative 1 (reasoning field):', quote);
                
                if (!quote) {
                    quote = response.choices?.[0]?.text?.trim();
                    console.log('📝 Alternative 2 (text field):', quote);
                }
                
                if (!quote) {
                    quote = response.output?.trim();
                    console.log('📝 Alternative 3 (output field):', quote);
                }
                
                if (!quote) {
                    quote = response.result?.trim();
                    console.log('📝 Alternative 4 (result field):', quote);
                }
                
                if (!quote) {
                    console.log('🔍 All response keys:', Object.keys(response));
                    console.log('🔍 All choice keys:', Object.keys(response.choices?.[0] || {}));
                    console.log('🔍 All message keys:', Object.keys(response.choices?.[0]?.message || {}));
                }
            }
            
            if (!quote) {
                throw new Error('No quote generated - API returned empty response');
            }

            const cleanedQuote = this.cleanQuote(quote);
            console.log('🧹 Cleaned quote:', cleanedQuote);
            return cleanedQuote;
        } catch (error) {
            console.error('Error generating quote:', error);
            throw error;
        }
    }

    /**
     * Clean and format the generated quote
     * @param {string} quote - The raw quote text
     * @returns {string} The cleaned quote
     */
    cleanQuote(quote) {
        console.log('🧹 cleanQuote() input:', quote);
        
        // Remove quotes if they exist at start/end
        let cleaned = quote.trim();
        console.log('🔄 After trim:', cleaned);
        
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.slice(1, -1);
            console.log('🔄 After removing quotes:', cleaned);
        }
        
        // Remove common prefixes
        const prefixes = ['Here is', 'Here\'s', 'Quote:', 'Inspirational quote:', 'Wise words:'];
        for (const prefix of prefixes) {
            if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
                console.log('🔄 Removing prefix:', prefix);
                cleaned = cleaned.substring(prefix.length).trim();
                console.log('🔄 After removing prefix:', cleaned);
            }
        }
        
        const result = cleaned.trim();
        console.log('✨ cleanQuote() output:', result);
        return result;
    }

    /**
     * Validate the API key by making a test request
     * @returns {Promise<boolean>} True if valid
     */
    async validateApiKey() {
        if (!this.apiKey) return false;

        try {
            const requestBody = {
                model: API_CONFIG.model,
                messages: [
                    { role: 'user', content: 'Test' }
                ],
                max_tokens: 1
            };

            await this.makeRequest('/chat/completions', {
                body: JSON.stringify(requestBody)
            });

            return true;
        } catch (error) {
            if (error.message.includes('401') || error.message.includes('invalid')) {
                throw new Error('Invalid API key');
            }
            throw error;
        }
    }

    /**
     * Get available models from OpenRouter
     * @returns {Promise<Array>} List of available models
     */
    async getModels() {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    }

    /**
     * Get API usage information
     * @returns {Promise<Object>} Usage data
     */
    async getUsage() {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/usage`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching usage:', error);
            throw error;
        }
    }

    /**
     * Handle API errors with user-friendly messages
     * @param {Error} error - The error object
     * @returns {string} User-friendly error message
     */
    static handleApiError(error) {
        if (error.message.includes('API key')) {
            return 'Invalid API key. Please check your OpenRouter API key in settings.';
        }
        if (error.message.includes('Network')) {
            return 'Network error. Please check your internet connection.';
        }
        if (error.message.includes('rate limit')) {
            return 'Rate limit exceeded. Please try again later.';
        }
        if (error.message.includes('insufficient')) {
            return 'Insufficient credits. Please check your OpenRouter account.';
        }
        return 'An error occurred while generating the quote. Please try again.';
    }
}

// Create a singleton instance
export const apiClient = new ApiClient();
