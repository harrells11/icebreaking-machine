/**
 * Settings Model
 * Manages user settings persistence to localStorage
 */

const SettingsModel = {
    key: "icebreaking_user_settings",
    
    /**
     * Load settings from localStorage with defaults
     * @returns {Object} Settings object
     */
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (raw) {
                const stored = JSON.parse(raw);
                // Merge with defaults to handle new fields
                return { ...this.getDefaults(), ...stored };
            }
        } catch (error) {
            console.error('[SettingsModel] Error loading settings:', error);
        }
        
        return this.getDefaults();
    },
    
    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaults() {
        return {
            // Basics
            alma_mater: "",
            personal_notes: "",
            personal_interests: "",
            event_timeframe_days: 120, // 30|60|90|120
            
            // Writing Style
            writing_style_guide: "Professional, confident, approachable. Short sentences (10–16 words). Focus on recent, specific achievements.",
            banned_phrases: [],
            approved_phrases: [],
            pending_style_suggestions: [],
            
            // AI Prompts
            research_prompt: "",     // Empty means use default
            icebreaker_prompt: "",   // Empty means use default
            
            // Live AI Mode (Chunk 7)
            use_live_ai: false,      // Toggle to use real AI generation
            ai_provider: "anthropic", // "anthropic" or "openai"
            ai_model: "claude-3-5-sonnet-20241022", // Default model
            ai_temperature: 0.2,     // Creativity (0.0 - 1.0)
            ai_max_tokens: 300,      // Maximum response length
            
            // Billing & Credits
            credits_per_generation: 1,
            reset_day: 23,
            allow_manual_credit_reset: true
        };
    },
    
    /**
     * Save settings to localStorage
     * @param {Object} settings - Settings object to save
     */
    save(settings) {
        try {
            localStorage.setItem(this.key, JSON.stringify(settings));
            console.log('[SettingsModel] Settings saved successfully');
            return true;
        } catch (error) {
            console.error('[SettingsModel] Error saving settings:', error);
            return false;
        }
    },
    
    /**
     * Get a specific setting value
     * @param {string} key - Setting key
     * @returns {*} Setting value
     */
    get(key) {
        const settings = this.load();
        return settings[key];
    },
    
    /**
     * Set a specific setting value
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    set(key, value) {
        const settings = this.load();
        settings[key] = value;
        this.save(settings);
    },
    
    /**
     * Reset to defaults
     */
    reset() {
        const defaults = this.getDefaults();
        this.save(defaults);
        console.log('[SettingsModel] Settings reset to defaults');
    },
    
    /**
     * Add phrase to banned list
     * @param {string} phrase - Phrase to ban
     */
    addBannedPhrase(phrase) {
        const settings = this.load();
        if (!settings.banned_phrases.includes(phrase)) {
            settings.banned_phrases.push(phrase);
            this.save(settings);
        }
    },
    
    /**
     * Remove phrase from banned list
     * @param {string} phrase - Phrase to remove
     */
    removeBannedPhrase(phrase) {
        const settings = this.load();
        settings.banned_phrases = settings.banned_phrases.filter(p => p !== phrase);
        this.save(settings);
    },
    
    /**
     * Add phrase to approved list
     * @param {string} phrase - Phrase to approve
     */
    addApprovedPhrase(phrase) {
        const settings = this.load();
        if (!settings.approved_phrases.includes(phrase)) {
            settings.approved_phrases.push(phrase);
            this.save(settings);
        }
    },
    
    /**
     * Remove phrase from approved list
     * @param {string} phrase - Phrase to remove
     */
    removeApprovedPhrase(phrase) {
        const settings = this.load();
        settings.approved_phrases = settings.approved_phrases.filter(p => p !== phrase);
        this.save(settings);
    },
    
    /**
     * Add pending style suggestion
     * @param {Object} suggestion - Suggestion object
     */
    addPendingSuggestion(suggestion) {
        const settings = this.load();
        settings.pending_style_suggestions.push(suggestion);
        this.save(settings);
    },
    
    /**
     * Remove pending style suggestion
     * @param {string} suggestionId - Suggestion ID
     */
    removePendingSuggestion(suggestionId) {
        const settings = this.load();
        settings.pending_style_suggestions = settings.pending_style_suggestions.filter(
            s => s.id !== suggestionId
        );
        this.save(settings);
    },
    
    /**
     * Clear all pending suggestions
     */
    clearPendingSuggestions() {
        const settings = this.load();
        settings.pending_style_suggestions = [];
        this.save(settings);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModel;
}

// Make globally accessible in browser
if (typeof window !== 'undefined') {
    window.SettingsModel = SettingsModel;
}
