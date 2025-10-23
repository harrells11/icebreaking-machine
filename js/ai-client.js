/**
 * AI Client
 * Handles communication with the serverless AI generation endpoint
 * Keeps API keys secure on the server side
 */

/**
 * Generate icebreakers using Live AI
 * @param {string} prompt - The complete prompt for generation
 * @returns {Promise<Object>} { text, tokens, usage }
 * @throws {Error} If generation fails
 */
async function generateIcebreakersLive(prompt) {
    if (!window.SettingsModel) {
        throw new Error('SettingsModel not available');
    }

    const settings = window.SettingsModel.load();
    
    // Build request payload
    const payload = {
        provider: settings.ai_provider || 'anthropic',
        model: settings.ai_model || 'claude-3-5-sonnet-20241022',
        temperature: parseFloat(settings.ai_temperature) || 0.2,
        max_tokens: parseInt(settings.ai_max_tokens) || 300,
        prompt: prompt
    };

    console.log('[AI Client] Sending request:', {
        provider: payload.provider,
        model: payload.model,
        temperature: payload.temperature,
        max_tokens: payload.max_tokens,
        prompt_length: prompt.length
    });

    try {
        // Determine endpoint based on environment
        // Try multiple endpoints in case of different deployment platforms
        const endpoints = [
            '/api/generate',              // Vercel
            '/.netlify/functions/generate' // Netlify
        ];
        
        let response = null;
        let lastError = null;
        
        // Try each endpoint
        for (const endpoint of endpoints) {
            try {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                // If we got a response (even error), break
                if (response) break;
            } catch (err) {
                lastError = err;
                continue;
            }
        }
        
        if (!response) {
            throw new Error(`Failed to connect to AI endpoint: ${lastError?.message || 'Unknown error'}`);
        }

        // Parse response
        const data = await response.json().catch(() => ({
            error: 'Invalid JSON response',
            message: 'Server returned invalid JSON'
        }));

        // Handle error responses
        if (!response.ok) {
            const errorMessage = data.message || data.error || 'Generation failed';
            const errorDetails = data.details ? `\n${data.details}` : '';
            
            throw new Error(`${errorMessage}${errorDetails}`);
        }

        // Extract usage information
        const tokensHeader = response.headers.get('X-Usage-Tokens');
        const tokens = tokensHeader ? parseInt(tokensHeader) : null;

        console.log('[AI Client] Generation successful:', {
            provider: data.provider,
            model: data.model,
            text_length: data.text?.length || 0,
            tokens: tokens || data.usage
        });

        return {
            text: data.text || '',
            tokens: tokens,
            usage: data.usage || null,
            provider: data.provider,
            model: data.model,
            timestamp: data.timestamp
        };

    } catch (error) {
        console.error('[AI Client] Generation failed:', error);
        
        // Re-throw with more context
        throw new Error(`Live AI generation failed: ${error.message}`);
    }
}

/**
 * Test the AI endpoint connection
 * @returns {Promise<boolean>} True if endpoint is reachable
 */
async function testAIEndpoint() {
    try {
        const endpoints = [
            '/api/generate',
            '/.netlify/functions/generate'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: 'anthropic',
                        model: 'test',
                        prompt: 'test'
                    })
                });
                
                // We expect an error since we're not providing valid data
                // But if we get any response, the endpoint exists
                if (response) {
                    console.log(`[AI Client] Found endpoint: ${endpoint}`);
                    return true;
                }
            } catch (err) {
                continue;
            }
        }
        
        return false;
    } catch (error) {
        console.error('[AI Client] Endpoint test failed:', error);
        return false;
    }
}

/**
 * Get AI provider status
 * @returns {Promise<Object>} Status information
 */
async function getAIStatus() {
    const settings = window.SettingsModel ? window.SettingsModel.load() : {};
    
    return {
        enabled: settings.use_live_ai || false,
        provider: settings.ai_provider || 'anthropic',
        model: settings.ai_model || 'claude-3-5-sonnet-20241022',
        temperature: settings.ai_temperature || 0.2,
        max_tokens: settings.ai_max_tokens || 300,
        endpoint_available: await testAIEndpoint()
    };
}

/**
 * Validate settings before making a request
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateAISettings() {
    const settings = window.SettingsModel ? window.SettingsModel.load() : {};
    const errors = [];
    
    if (!settings.use_live_ai) {
        errors.push('Live AI is not enabled in settings');
    }
    
    if (!settings.ai_provider) {
        errors.push('AI provider not specified');
    }
    
    if (!settings.ai_model) {
        errors.push('AI model not specified');
    }
    
    if (typeof settings.ai_temperature !== 'number' || settings.ai_temperature < 0 || settings.ai_temperature > 1) {
        errors.push('Invalid temperature value (must be 0.0 - 1.0)');
    }
    
    if (!settings.ai_max_tokens || settings.ai_max_tokens < 50 || settings.ai_max_tokens > 1000) {
        errors.push('Invalid max tokens value (must be 50 - 1000)');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateIcebreakersLive,
        testAIEndpoint,
        getAIStatus,
        validateAISettings
    };
}
