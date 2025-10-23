/**
 * Settings UI
 * Manages the Settings page with 4 tabs: Basics, Writing Style, AI Prompts, Billing & Credits
 */

class SettingsUI {
    constructor(creditTracker) {
        console.log('[SettingsUI] Constructor called');
        this.creditTracker = creditTracker;
        this.currentTab = 'basics';
        this.initTabSwitching();
        console.log('[SettingsUI] Constructor complete');
    }

    /**
     * Initialize tab switching functionality
     */
    initTabSwitching() {
        console.log('[SettingsUI] initTabSwitching() called');
        const tabs = document.querySelectorAll('.settings-tab-btn');
        console.log('[SettingsUI] Found', tabs.length, 'tab buttons');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                console.log('[SettingsUI] Tab clicked:', tabName);
                this.switchTab(tabName);
            });
        });

        // Save button
        const saveBtn = document.getElementById('save-all-settings');
        console.log('[SettingsUI] Save button found:', !!saveBtn);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAllSettings());
        }
    }

    /**
     * Switch to a different tab
     * @param {string} tabName - Tab name (basics, writing-style, ai-prompts, billing)
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.settings-tab-btn').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content panels
        document.querySelectorAll('.settings-tab-content').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Map tab names to content IDs
        const tabIdMap = {
            'basics': 'tab-basics',
            'writing-style': 'tab-style',
            'ai-prompts': 'tab-prompts',
            'billing': 'tab-billing'
        };
        
        const contentId = tabIdMap[tabName];
        if (contentId) {
            document.getElementById(contentId)?.classList.add('active');
        }

        this.currentTab = tabName;
    }

    /**
     * Render all settings tabs
     */
    renderSettings() {
        console.log('[SettingsUI] renderSettings() called');
        
        // Show a toast to confirm this is being called
        if (typeof showToast === 'function') {
            showToast('Loading settings...', 'info');
        }
        
        console.log('[SettingsUI] Rendering Basics tab...');
        this.renderBasicsTab();
        console.log('[SettingsUI] Rendering Style tab...');
        this.renderStyleTab();
        console.log('[SettingsUI] Rendering Prompts tab...');
        this.renderPromptsTab();
        console.log('[SettingsUI] Rendering Billing tab...');
        this.renderBillingTab();
        
        // Attach Live AI toggle listener after rendering
        console.log('[SettingsUI] Attaching Live AI listeners...');
        this.attachLiveAIListeners();
        console.log('[SettingsUI] renderSettings() complete');
    }
    
    /**
     * Attach event listeners for Live AI controls
     */
    attachLiveAIListeners() {
        const useLiveAICheckbox = document.getElementById('use-live-ai');
        if (useLiveAICheckbox) {
            useLiveAICheckbox.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                
                // Enable/disable AI configuration inputs
                document.getElementById('ai-provider').disabled = !enabled;
                document.getElementById('ai-model').disabled = !enabled;
                document.getElementById('ai-temperature').disabled = !enabled;
                document.getElementById('ai-max-tokens').disabled = !enabled;
                
                // Show toast notification
                if (enabled) {
                    showToast('Live AI Mode enabled. Remember to save settings!', 'info');
                } else {
                    showToast('Live AI Mode disabled. Using simulation fallback.', 'info');
                }
            });
        }
    }

    /**
     * Render Basics tab
     */
    renderBasicsTab() {
        try {
            console.log('[SettingsUI] renderBasicsTab() called');
            console.log('[SettingsUI] window.SettingsModel available:', typeof window.SettingsModel !== 'undefined');
            
            const settings = window.SettingsModel.load();
            console.log('[SettingsUI] Settings loaded:', settings);
            const container = document.getElementById('tab-basics');
            console.log('[SettingsUI] Container found:', container);
            if (!container) {
                console.error('[SettingsUI] ERROR: tab-basics container not found!');
                return;
            }

            console.log('[SettingsUI] About to set container.innerHTML...');
            console.log('[SettingsUI] Current container HTML length:', container.innerHTML.length);
            
            // Clear existing content first
            container.innerHTML = '';
            console.log('[SettingsUI] Cleared container');
            
            // Now set new content
            const renderTime = new Date().toLocaleTimeString();
            container.innerHTML = `
            <div class="settings-section">
                <h3>Personal Information <small style="color: #999; font-size: 12px;">(Rendered at ${renderTime})</small></h3>
                <p class="settings-description">
                    This information helps generate more personalized icebreakers by identifying shared connections and interests.
                </p>

                <div class="form-group">
                    <label for="alma-mater">Alma Mater</label>
                    <input 
                        type="text" 
                        id="alma-mater" 
                        value="${this.escapeHtml(settings.alma_mater)}"
                        placeholder="e.g., Vanderbilt University"
                    >
                    <small>Your university or college (used to identify alumni connections)</small>
                </div>

                <div class="form-group">
                    <label for="personal-notes">Personal Notes</label>
                    <textarea 
                        id="personal-notes" 
                        rows="6"
                        placeholder="Background info, career highlights, specialties..."
                    >${this.escapeHtml(settings.personal_notes)}</textarea>
                    <small>Optional context about your background and expertise</small>
                </div>

                <div class="form-group">
                    <label for="personal-interests">Personal Interests & Volunteer Work</label>
                    <textarea 
                        id="personal-interests" 
                        rows="6"
                        placeholder="Hobbies, volunteer activities, community involvement..."
                    >${this.escapeHtml(settings.personal_interests)}</textarea>
                    <small>Helps identify shared interests with contacts</small>
                </div>

                <div class="form-group">
                    <label for="event-timeframe">Event Timeframe</label>
                    <select id="event-timeframe">
                        <option value="30" ${settings.event_timeframe_days === 30 ? 'selected' : ''}>30 days</option>
                        <option value="60" ${settings.event_timeframe_days === 60 ? 'selected' : ''}>60 days</option>
                        <option value="90" ${settings.event_timeframe_days === 90 ? 'selected' : ''}>90 days</option>
                        <option value="120" ${settings.event_timeframe_days === 120 ? 'selected' : ''}>120 days (recommended)</option>
                    </select>
                    <small>How far back to search for recent activities</small>
                </div>
            </div>
        `;
            console.log('[SettingsUI] container.innerHTML set successfully');
            console.log('[SettingsUI] renderBasicsTab() complete');
        } catch (error) {
            console.error('[SettingsUI] ERROR in renderBasicsTab():', error);
            console.error('[SettingsUI] Error stack:', error.stack);
            // Show error in the container
            const container = document.getElementById('tab-basics');
            if (container) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #e74c3c;">
                        <h3>Error Loading Settings</h3>
                        <p>${error.message}</p>
                        <pre style="text-align: left; background: #f7f9fa; padding: 16px; border-radius: 8px; overflow: auto;">${error.stack}</pre>
                    </div>
                `;
            }
        }
    }

    /**
     * Render Writing Style tab
     */
    renderStyleTab() {
        const settings = window.SettingsModel.load();
        const container = document.getElementById('tab-style');
        if (!container) return;

        container.innerHTML = `
            <div class="settings-section">
                <h3>Writing Style Guide</h3>
                <p class="settings-description">
                    Define your preferred writing style for icebreakers. This guide is used by the AI to match your voice and tone.
                </p>

                <div class="form-group">
                    <label for="writing-style-guide">Style Guide</label>
                    <textarea 
                        id="writing-style-guide" 
                        rows="6"
                        placeholder="Professional, confident, approachable..."
                    >${this.escapeHtml(settings.writing_style_guide)}</textarea>
                    <small>Describe your preferred tone, sentence length, and approach</small>
                </div>
            </div>

            <div class="settings-section">
                <h3>Banned Phrases</h3>
                <p class="settings-description">
                    Phrases to avoid in icebreakers (e.g., overly generic or ineffective phrases).
                </p>
                <div class="phrase-manager">
                    <div class="phrase-chips banned-chips" id="banned-chips">
                        ${this.renderPhraseChips(settings.banned_phrases, 'banned')}
                    </div>
                    <div class="phrase-input-group">
                        <input 
                            type="text" 
                            id="new-banned-phrase" 
                            placeholder="Type a phrase to ban..."
                        >
                        <button class="btn btn-secondary" onclick="settingsUI.addPhrase('banned')">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3>Approved Phrases</h3>
                <p class="settings-description">
                    Phrases that work well and should be used more often.
                </p>
                <div class="phrase-manager">
                    <div class="phrase-chips approved-chips" id="approved-chips">
                        ${this.renderPhraseChips(settings.approved_phrases, 'approved')}
                    </div>
                    <div class="phrase-input-group">
                        <input 
                            type="text" 
                            id="new-approved-phrase" 
                            placeholder="Type a phrase to approve..."
                        >
                        <button class="btn btn-secondary" onclick="settingsUI.addPhrase('approved')">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>

            ${this.renderPendingSuggestions(settings.pending_style_suggestions)}
        `;
    }

    /**
     * Render phrase chips
     * @param {Array} phrases - Array of phrases
     * @param {string} type - 'banned' or 'approved'
     * @returns {string} HTML
     */
    renderPhraseChips(phrases, type) {
        if (phrases.length === 0) {
            return `<p class="empty-phrases">No ${type} phrases yet</p>`;
        }

        return phrases.map(phrase => `
            <div class="phrase-chip ${type}">
                <span>${this.escapeHtml(phrase)}</span>
                <button class="remove-chip" onclick="settingsUI.removePhrase('${type}', '${this.escapeHtml(phrase)}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    /**
     * Render pending style suggestions
     * @param {Array} suggestions - Array of suggestions
     * @returns {string} HTML
     */
    renderPendingSuggestions(suggestions) {
        if (suggestions.length === 0) {
            return '';
        }

        return `
            <div class="settings-section">
                <h3>AI-Suggested Improvements</h3>
                <p class="settings-description">
                    Based on your feedback, the AI has generated these suggestions. Accept to apply them to your style guide or phrase lists.
                </p>
                <div class="suggestions-list">
                    ${suggestions.map(s => this.renderSuggestion(s)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual suggestion
     * @param {Object} suggestion - Suggestion object
     * @returns {string} HTML
     */
    renderSuggestion(suggestion) {
        const typeClass = suggestion.type === 'critical' ? 'critical' : suggestion.type === 'warning' ? 'warning' : 'info';
        
        return `
            <div class="suggestion-card ${typeClass}">
                <div class="suggestion-header">
                    <h4>${suggestion.title}</h4>
                    <span class="suggestion-badge">${suggestion.category}</span>
                </div>
                <p class="suggestion-message">${suggestion.message}</p>
                <p class="suggestion-action"><strong>Recommended:</strong> ${suggestion.action}</p>
                ${suggestion.phrases ? `
                    <div class="suggestion-phrases">
                        ${suggestion.phrases.map(p => `<code>${p}</code>`).join(', ')}
                    </div>
                ` : ''}
                <div class="suggestion-actions">
                    <button class="btn btn-sm btn-success" onclick="settingsUI.acceptSuggestion('${suggestion.id}')">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="settingsUI.dismissSuggestion('${suggestion.id}')">
                        <i class="fas fa-times"></i> Dismiss
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render AI Prompts tab
     */
    renderPromptsTab() {
        const settings = window.SettingsModel.load();
        const container = document.getElementById('tab-prompts');
        if (!container) return;

        const researchPrompt = settings.research_prompt || DEFAULT_RESEARCH_PROMPT;
        const icebreakerPrompt = settings.icebreaker_prompt || DEFAULT_ICEBREAKER_PROMPT;

        container.innerHTML = `
            <!-- Live AI Mode Configuration -->
            <div class="settings-section live-ai-section">
                <h3><i class="fas fa-robot"></i> Live AI Mode</h3>
                <p class="settings-description">
                    Enable real AI generation using Anthropic Claude or OpenAI GPT models. 
                    <strong>API keys are configured securely on the server (not in the browser).</strong>
                </p>

                <div class="live-ai-controls">
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                id="use-live-ai"
                                ${settings.use_live_ai ? 'checked' : ''}
                            >
                            <span>Use Live AI Generation</span>
                        </label>
                        <small>When enabled, icebreakers will be generated using real AI models instead of simulation</small>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="ai-provider">AI Provider</label>
                            <select id="ai-provider" ${!settings.use_live_ai ? 'disabled' : ''}>
                                <option value="anthropic" ${settings.ai_provider === 'anthropic' ? 'selected' : ''}>
                                    Anthropic (Claude)
                                </option>
                                <option value="openai" ${settings.ai_provider === 'openai' ? 'selected' : ''}>
                                    OpenAI (GPT)
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="ai-model">Model</label>
                            <input 
                                type="text" 
                                id="ai-model" 
                                value="${this.escapeHtml(settings.ai_model)}"
                                placeholder="claude-3-5-sonnet-20241022"
                                ${!settings.use_live_ai ? 'disabled' : ''}
                            >
                            <small>Model identifier (e.g., claude-3-5-sonnet-20241022, gpt-4, gpt-3.5-turbo)</small>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="ai-temperature">Temperature</label>
                            <input 
                                type="number" 
                                id="ai-temperature" 
                                value="${settings.ai_temperature}"
                                min="0"
                                max="1"
                                step="0.1"
                                ${!settings.use_live_ai ? 'disabled' : ''}
                            >
                            <small>Creativity level (0.0 = focused, 1.0 = creative)</small>
                        </div>

                        <div class="form-group">
                            <label for="ai-max-tokens">Max Tokens</label>
                            <input 
                                type="number" 
                                id="ai-max-tokens" 
                                value="${settings.ai_max_tokens}"
                                min="50"
                                max="1000"
                                step="50"
                                ${!settings.use_live_ai ? 'disabled' : ''}
                            >
                            <small>Maximum response length (50-1000)</small>
                        </div>
                    </div>

                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Security Note:</strong> API keys are never stored in your browser or localStorage. 
                            They are configured as environment variables on your serverless function deployment 
                            (Vercel, Netlify, etc.). See deployment documentation for setup instructions.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Prompt Templates -->
            <div class="settings-section">
                <h3>Research Prompt</h3>
                <p class="settings-description">
                    Custom prompt for the AI research engine. Leave empty to use the default. 
                    Supports placeholders: <code>{full_name}</code>, <code>{company}</code>, 
                    <code>{personal_linkedin_url}</code>, <code>{alma_mater}</code>, 
                    <code>{event_timeframe_days}</code>
                </p>

                <div class="form-group">
                    <textarea 
                        id="research-prompt" 
                        rows="20"
                        class="prompt-textarea"
                        placeholder="Enter custom research prompt or leave empty for default..."
                    >${this.escapeHtml(researchPrompt)}</textarea>
                </div>

                <button class="btn btn-secondary" onclick="settingsUI.resetPrompt('research')">
                    <i class="fas fa-undo"></i> Reset to Default
                </button>
            </div>

            <div class="settings-section" style="margin-top: 32px;">
                <h3>Icebreaker Generation Prompt</h3>
                <p class="settings-description">
                    Custom prompt for generating icebreakers. Leave empty to use the default.
                    Supports placeholders: <code>{full_name}</code>, <code>{company}</code>, 
                    <code>{activity_summary}</code>, <code>{activity_type}</code>, 
                    <code>{activity_date}</code>, <code>{source_url}</code>, 
                    <code>{writing_style_guide}</code>, <code>{banned_phrases}</code>, 
                    <code>{approved_phrases}</code>
                </p>

                <div class="form-group">
                    <textarea 
                        id="icebreaker-prompt" 
                        rows="20"
                        class="prompt-textarea"
                        placeholder="Enter custom icebreaker prompt or leave empty for default..."
                    >${this.escapeHtml(icebreakerPrompt)}</textarea>
                </div>

                <button class="btn btn-secondary" onclick="settingsUI.resetPrompt('icebreaker')">
                    <i class="fas fa-undo"></i> Reset to Default
                </button>
            </div>
        `;
    }

    /**
     * Render Billing & Credits tab
     */
    renderBillingTab() {
        const settings = window.SettingsModel.load();
        const creditUsage = this.creditTracker.getUsage();
        const history = this.creditTracker.getHistory();
        const container = document.getElementById('tab-billing');
        if (!container) return;

        container.innerHTML = `
            <div class="settings-section">
                <h3>Credit Configuration</h3>
                <p class="settings-description">
                    Manage how Genspark credits are consumed for icebreaker generation.
                </p>

                <div class="form-group">
                    <label for="credits-per-generation">Credits per Generation</label>
                    <input 
                        type="number" 
                        id="credits-per-generation" 
                        value="${settings.credits_per_generation}"
                        min="1"
                        max="10"
                    >
                    <small>Number of credits consumed for each icebreaker generation (currently ${settings.credits_per_generation} credit${settings.credits_per_generation !== 1 ? 's' : ''})</small>
                </div>

                <div class="form-group">
                    <label>Credit Reset Day</label>
                    <input 
                        type="number" 
                        value="23"
                        disabled
                    >
                    <small>Credits automatically reset on the 23rd of each month</small>
                </div>
            </div>

            <div class="settings-section">
                <h3>Current Usage</h3>
                <div class="billing-summary">
                    <div class="billing-card">
                        <div class="billing-icon">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <div class="billing-info">
                            <div class="billing-label">Credits Used This Month</div>
                            <div class="billing-value">${creditUsage.count}</div>
                            <div class="billing-meta">Next reset: ${creditUsage.next_reset}</div>
                        </div>
                    </div>
                </div>

                ${settings.allow_manual_credit_reset ? `
                    <button class="btn btn-warning" onclick="settingsUI.manualResetCredits()" style="margin-top: 16px;">
                        <i class="fas fa-sync"></i> Reset Credits Now
                    </button>
                    <p class="help-text" style="margin-top: 8px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        This will reset your current month's credit usage to 0. Use with caution.
                    </p>
                ` : ''}
            </div>

            <div class="settings-section">
                <h3>Credit History</h3>
                <p class="settings-description">
                    Your credit usage over the past months.
                </p>
                <div class="credit-history">
                    ${this.renderCreditHistory(history)}
                </div>
            </div>
        `;
    }

    /**
     * Render credit history
     * @param {Array} history - Credit history array
     * @returns {string} HTML
     */
    renderCreditHistory(history) {
        if (history.length === 0) {
            return `<p class="empty-history">No history available yet</p>`;
        }

        // Show last 12 months
        const recent = history.slice(-12).reverse();
        
        return `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Credits Used</th>
                        <th>Archived</th>
                    </tr>
                </thead>
                <tbody>
                    ${recent.map(entry => `
                        <tr>
                            <td>${this.formatMonth(entry.month)}</td>
                            <td>${entry.count}</td>
                            <td>${this.formatDate(entry.archived_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Save all settings
     */
    saveAllSettings() {
        const settings = window.SettingsModel.load();

        // Basics tab
        settings.alma_mater = document.getElementById('alma-mater')?.value || '';
        settings.personal_notes = document.getElementById('personal-notes')?.value || '';
        settings.personal_interests = document.getElementById('personal-interests')?.value || '';
        settings.event_timeframe_days = parseInt(document.getElementById('event-timeframe')?.value) || 120;

        // Style tab
        settings.writing_style_guide = document.getElementById('writing-style-guide')?.value || settings.writing_style_guide;

        // Prompts tab
        settings.research_prompt = document.getElementById('research-prompt')?.value || '';
        settings.icebreaker_prompt = document.getElementById('icebreaker-prompt')?.value || '';
        
        // Live AI settings
        settings.use_live_ai = document.getElementById('use-live-ai')?.checked || false;
        settings.ai_provider = document.getElementById('ai-provider')?.value || 'anthropic';
        settings.ai_model = document.getElementById('ai-model')?.value || 'claude-3-5-sonnet-20241022';
        settings.ai_temperature = parseFloat(document.getElementById('ai-temperature')?.value) || 0.2;
        settings.ai_max_tokens = parseInt(document.getElementById('ai-max-tokens')?.value) || 300;

        // Billing tab
        settings.credits_per_generation = parseInt(document.getElementById('credits-per-generation')?.value) || 1;

        // Save to localStorage
        if (window.SettingsModel.save(settings)) {
            showToast('Settings saved successfully!', 'success');
        } else {
            showToast('Error saving settings', 'error');
        }
    }

    /**
     * Add phrase to list
     * @param {string} type - 'banned' or 'approved'
     */
    addPhrase(type) {
        const inputId = type === 'banned' ? 'new-banned-phrase' : 'new-approved-phrase';
        const input = document.getElementById(inputId);
        if (!input) return;

        const phrase = input.value.trim();
        if (!phrase) {
            showToast('Please enter a phrase', 'warning');
            return;
        }

        if (type === 'banned') {
            window.SettingsModel.addBannedPhrase(phrase);
        } else {
            window.SettingsModel.addApprovedPhrase(phrase);
        }

        input.value = '';
        this.renderStyleTab();
        showToast(`Phrase added to ${type} list`, 'success');
    }

    /**
     * Remove phrase from list
     * @param {string} type - 'banned' or 'approved'
     * @param {string} phrase - Phrase to remove
     */
    removePhrase(type, phrase) {
        if (type === 'banned') {
            window.SettingsModel.removeBannedPhrase(phrase);
        } else {
            window.SettingsModel.removeApprovedPhrase(phrase);
        }

        this.renderStyleTab();
        showToast(`Phrase removed from ${type} list`, 'success');
    }

    /**
     * Accept suggestion
     * @param {string} suggestionId - Suggestion ID
     */
    acceptSuggestion(suggestionId) {
        const settings = window.SettingsModel.load();
        const suggestion = settings.pending_style_suggestions.find(s => s.id === suggestionId);
        
        if (!suggestion) return;

        // Apply suggestion based on category
        if (suggestion.category === 'banned_phrases' && suggestion.phrases) {
            suggestion.phrases.forEach(phrase => {
                SettingsModel.addBannedPhrase(phrase);
            });
        } else if (suggestion.category === 'approved_phrases' && suggestion.phrases) {
            suggestion.phrases.forEach(phrase => {
                SettingsModel.addApprovedPhrase(phrase);
            });
        }

        // Remove from pending
        SettingsModel.removePendingSuggestion(suggestionId);
        
        this.renderStyleTab();
        showToast('Suggestion applied successfully!', 'success');
    }

    /**
     * Dismiss suggestion
     * @param {string} suggestionId - Suggestion ID
     */
    dismissSuggestion(suggestionId) {
        SettingsModel.removePendingSuggestion(suggestionId);
        this.renderStyleTab();
        showToast('Suggestion dismissed', 'info');
    }

    /**
     * Reset prompt to default
     * @param {string} type - 'research' or 'icebreaker'
     */
    resetPrompt(type) {
        const textareaId = type === 'research' ? 'research-prompt' : 'icebreaker-prompt';
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        const defaultPrompt = type === 'research' ? DEFAULT_RESEARCH_PROMPT : DEFAULT_ICEBREAKER_PROMPT;
        textarea.value = defaultPrompt;
        
        showToast(`${type === 'research' ? 'Research' : 'Icebreaker'} prompt reset to default`, 'success');
    }

    /**
     * Manual credit reset
     */
    manualResetCredits() {
        if (!confirm('Are you sure you want to reset your credits for this month? This action cannot be undone.')) {
            return;
        }

        this.creditTracker.manualReset();
        this.renderBillingTab();
        
        // Update dashboard if visible
        if (window.dashboardUI) {
            window.dashboardUI.renderDashboard();
        }

        showToast('Credits reset successfully!', 'success');
    }

    /**
     * Format month string
     * @param {string} month - Month in YYYY-MM format
     * @returns {string} Formatted month
     */
    formatMonth(month) {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    /**
     * Format date
     * @param {string} dateStr - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    /**
     * Escape HTML
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsUI;
}
