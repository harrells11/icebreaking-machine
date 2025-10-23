// ============================================
// Icebreaker Engine - AI Simulation
// Generates personalized icebreakers based on research
// ============================================

class IcebreakerEngine {
    constructor(contactManager) {
        this.contactManager = contactManager;
        this.isGenerating = false;
    }

    // ============================================
    // Main Generation Method
    // ============================================

    async generateIcebreakers(contactId) {
        if (this.isGenerating) {
            showToast('Icebreaker generation already in progress', 'info');
            return false;
        }

        const contact = this.contactManager.getContactById(contactId);
        
        if (!contact) {
            console.error('Contact not found:', contactId);
            return false;
        }

        if (!contact.research_approved) {
            showToast('Research must be approved before generating icebreakers', 'error');
            return false;
        }

        this.isGenerating = true;

        // Update status to generating
        this.contactManager.updateContact(contactId, {
            research_status: 'icebreaker_generating'
        });

        // Check if using Live AI
        const settings = window.SettingsModel ? window.SettingsModel.load() : { use_live_ai: false };
        const useLiveAI = settings.use_live_ai && typeof window.generateIcebreakersLive === 'function';

        showToast(`Generating icebreakers for ${contact.full_name}...${useLiveAI ? ' (Live AI)' : ''}`, 'info');

        // Refresh UI to show generating status
        if (window.contactUI) {
            window.contactUI.renderContacts();
            window.contactUI.updateDashboardStats();
        }

        let icebreakers;
        let generationMethod = 'simulation';

        try {
            if (useLiveAI) {
                // ============================================
                // LIVE AI MODE
                // ============================================
                console.log('[IcebreakerEngine] Using Live AI generation');
                
                // Build prompt using contact data and settings
                const prompt = window.buildIcebreakerPrompt ? 
                    window.buildIcebreakerPrompt(contact) : 
                    this.buildFallbackPrompt(contact);
                
                console.log('[IcebreakerEngine] Prompt length:', prompt.length);
                
                // Call AI endpoint
                const result = await window.generateIcebreakersLive(prompt);
                
                console.log('[IcebreakerEngine] AI response:', {
                    text_length: result.text?.length || 0,
                    tokens: result.tokens
                });
                
                // Parse response to extract A and B
                const parsed = window.parseIcebreakerResponse ? 
                    window.parseIcebreakerResponse(result.text) :
                    this.parseFallbackResponse(result.text);
                
                icebreakers = {
                    icebreaker_a: parsed.icebreaker_a || 'Error parsing icebreaker A',
                    icebreaker_b: parsed.icebreaker_b || 'Error parsing icebreaker B'
                };
                
                generationMethod = 'live_ai';
                
            } else {
                // ============================================
                // SIMULATION MODE (Default)
                // ============================================
                console.log('[IcebreakerEngine] Using simulation mode');
                
                // Simulate AI generation delay (3-5 seconds)
                const delay = 3000 + Math.random() * 2000;
                await this.sleep(delay);
                
                // Generate using rule-based system
                icebreakers = this.createIcebreakers(contact);
                generationMethod = 'simulation';
            }
            
        } catch (error) {
            // ============================================
            // ERROR HANDLING WITH FALLBACK
            // ============================================
            console.error('[IcebreakerEngine] Live AI failed, falling back to simulation:', error);
            
            showToast('Live AI failed. Using simulation fallback...', 'warning');
            
            // Update status back to approved so user can retry
            this.contactManager.updateContact(contactId, {
                research_status: 'approved'
            });
            
            try {
                // Attempt simulation fallback
                const delay = 2000 + Math.random() * 1000;
                await this.sleep(delay);
                
                icebreakers = this.createIcebreakers(contact);
                generationMethod = 'simulation_fallback';
                
                console.log('[IcebreakerEngine] Fallback successful');
                
            } catch (fallbackError) {
                console.error('[IcebreakerEngine] Fallback also failed:', fallbackError);
                
                this.isGenerating = false;
                
                showToast('Generation failed. Please try again.', 'error');
                
                // Refresh UI
                if (window.contactUI) {
                    window.contactUI.renderContacts();
                    window.contactUI.updateDashboardStats();
                }
                
                return false;
            }
        }

        // Update contact with generated icebreakers
        this.contactManager.updateContact(contactId, {
            research_status: 'completed',
            icebreaker_a: icebreakers.icebreaker_a,
            icebreaker_b: icebreakers.icebreaker_b,
            generation_method: generationMethod,
            generation_date: new Date().toISOString()
        });

        // Increment credit usage (configurable via settings)
        if (window.creditTracker) {
            const creditsToUse = settings.credits_per_generation || 1;
            window.creditTracker.increment(creditsToUse);
            console.log(`[IcebreakerEngine] Credit usage incremented by ${creditsToUse} (method: ${generationMethod})`);
        }

        this.isGenerating = false;

        // Refresh UI
        if (window.contactUI) {
            window.contactUI.renderContacts();
            window.contactUI.updateDashboardStats();
        }

        if (window.researchUI) {
            window.researchUI.renderApprovalSection();
        }

        if (window.resultsUI) {
            window.resultsUI.renderResultsLibrary();
        }

        const methodLabel = generationMethod === 'live_ai' ? ' (Live AI)' : 
                          generationMethod === 'simulation_fallback' ? ' (Fallback)' : '';
        showToast(`Icebreakers generated for ${contact.full_name}!${methodLabel}`, 'success');
        
        return icebreakers;
    }
    
    // ============================================
    // Fallback Methods (when prompt-builder.js not loaded)
    // ============================================
    
    buildFallbackPrompt(contact) {
        return `Write 2 brief icebreakers for ${contact.full_name} at ${contact.company}.
Research: ${contact.activity_summary || 'No research available'}
Format: A: <first> B: <second>`;
    }
    
    parseFallbackResponse(text) {
        const lines = (text || '').split('\n').filter(l => l.trim());
        return {
            icebreaker_a: lines[0]?.replace(/^A:\s*/i, '').trim() || text.slice(0, 200),
            icebreaker_b: lines[1]?.replace(/^B:\s*/i, '').trim() || text.slice(200)
        };
    }

    // ============================================
    // Icebreaker Creation Logic
    // ============================================

    createIcebreakers(contact) {
        const activityType = contact.activity_type;
        const activitySummary = contact.activity_summary || '';
        const company = contact.company;
        const name = contact.full_name.split(' ')[0]; // First name
        const location = contact.contact_location || contact.company_location;

        let icebreaker_a, icebreaker_b;

        switch (activityType) {
            case 'recent_activity':
                icebreaker_a = this.generateRecentActivityIcebreaker(contact, 'direct');
                icebreaker_b = this.generateRecentActivityIcebreaker(contact, 'conversational');
                break;

            case 'alumni_connection':
                icebreaker_a = this.generateAlumniIcebreaker(contact, 'direct');
                icebreaker_b = this.generateAlumniIcebreaker(contact, 'enthusiastic');
                break;

            case 'volunteer_connection':
                icebreaker_a = this.generateVolunteerIcebreaker(contact, 'direct');
                icebreaker_b = this.generateVolunteerIcebreaker(contact, 'warm');
                break;

            case 'company_research':
                icebreaker_a = this.generateCompanyResearchIcebreaker(contact, 'professional');
                icebreaker_b = this.generateCompanyResearchIcebreaker(contact, 'collaborative');
                break;

            default:
                icebreaker_a = this.generateGenericIcebreaker(contact, 'style1');
                icebreaker_b = this.generateGenericIcebreaker(contact, 'style2');
        }

        return {
            icebreaker_a,
            icebreaker_b
        };
    }

    // ============================================
    // Activity Type Specific Generators
    // ============================================

    generateRecentActivityIcebreaker(contact, style) {
        const summary = contact.activity_summary;
        const company = contact.company;
        const location = contact.contact_location;

        const templates = {
            direct: [
                `I noticed ${this.extractKeyAction(summary)}. Impressive work navigating that transaction!`,
                `Saw your recent post about ${this.extractTopic(summary)}. Great insights on the market dynamics.`,
                `${this.extractKeyAction(summary)} caught my attention. Strong positioning in the current market.`,
                `Your thoughts on ${this.extractTopic(summary)} resonated with our team. Would love to discuss further.`
            ],
            conversational: [
                `Really enjoyed reading about ${this.extractTopic(summary)}. Your perspective on this is spot-on.`,
                `${this.extractKeyAction(summary)}—that's exactly the kind of forward-thinking the industry needs.`,
                `Your recent update about ${this.extractTopic(summary)} sparked some great conversations on our team.`,
                `Impressed by ${this.extractKeyAction(summary)}. Your approach to these deals is innovative.`
            ]
        };

        const options = templates[style] || templates.direct;
        return options[Math.floor(Math.random() * options.length)];
    }

    generateAlumniIcebreaker(contact, style) {
        const school = contact.alumni_school || contact.activity_summary.match(/attended\s+([^.]+)/)?.[1] || 'our alma mater';

        const templates = {
            direct: [
                `Saw we're both ${school} alumni! Small world in the CRE space. Would love to connect.`,
                `Fellow ${school} alum here! Always great to connect with someone from the Vol network.`,
                `${school} connection! Our alumni network in CRE is strong—would be great to add you to mine.`
            ],
            enthusiastic: [
                `Go Vols! Fellow ${school} alum checking in. Love seeing our network thrive in CRE.`,
                `${school} pride! Great to see another alum making moves in commercial real estate.`,
                `Small world—${school} alum here too! The Vol family in CRE is something special.`
            ]
        };

        const options = templates[style] || templates.direct;
        return options[Math.floor(Math.random() * options.length)];
    }

    generateVolunteerIcebreaker(contact, style) {
        const templates = {
            direct: [
                `I saw your involvement with the community initiative. Great to see CRE leaders giving back.`,
                `Your volunteer work caught my attention. That kind of community engagement matters.`,
                `Noticed your community involvement. Would love to learn more about the impact you're making.`
            ],
            warm: [
                `Love seeing your commitment to giving back to the community. That's the kind of leadership the industry needs.`,
                `Your volunteer work is inspiring. It's great to see professionals who prioritize community impact.`,
                `Really admire your dedication to community service. Would love to hear more about your experience.`
            ]
        };

        const options = templates[style] || templates.direct;
        return options[Math.floor(Math.random() * options.length)];
    }

    generateCompanyResearchIcebreaker(contact, style) {
        const company = contact.company;
        const location = contact.contact_location || contact.company_location;

        const templates = {
            professional: [
                `${company}'s growth trajectory in the Southeast has been impressive. Would love to learn more about your approach.`,
                `I've been following ${company}'s recent moves in the market. Your firm's positioning is strategic.`,
                `${company} is making strong plays in ${location || 'the region'}. Impressive market presence.`,
                `Your firm's reputation in the industry speaks for itself. Would value the chance to connect.`
            ],
            collaborative: [
                `${company}'s approach to CRE is innovative. I think there could be some interesting synergies between our firms.`,
                `Been impressed by ${company}'s market strategy. Would love to explore potential collaboration opportunities.`,
                `Your team at ${company} is doing great work. Always looking to connect with forward-thinking professionals.`,
                `${company}'s presence in the market is notable. I'd enjoy learning more about your team's approach.`
            ]
        };

        const options = templates[style] || templates.professional;
        return options[Math.floor(Math.random() * options.length)];
    }

    generateGenericIcebreaker(contact, style) {
        const company = contact.company;
        const title = contact.job_title;

        const templates = {
            style1: [
                `Your work at ${company} has caught my attention. Would love to connect and learn more about your approach.`,
                `Impressed by your track record in the industry. Would value the opportunity to connect.`,
                `Your expertise in commercial real estate is evident. I'd enjoy the chance to connect.`
            ],
            style2: [
                `As a fellow CRE professional, I'd love to connect and share insights about the market.`,
                `Would enjoy connecting with you—always looking to expand my network with experienced professionals.`,
                `Your background at ${company} is impressive. Let's connect and explore potential synergies.`
            ]
        };

        const options = templates[style] || templates.style1;
        return options[Math.floor(Math.random() * options.length)];
    }

    // ============================================
    // Helper Methods
    // ============================================

    extractKeyAction(summary) {
        // Extract the main action from activity summary
        const lowerSummary = summary.toLowerCase();
        
        if (lowerSummary.includes('closed') || lowerSummary.includes('closing')) {
            return summary.split('.')[0]; // First sentence usually contains the action
        }
        if (lowerSummary.includes('announced') || lowerSummary.includes('partnership')) {
            return summary.split('.')[0];
        }
        if (lowerSummary.includes('posted') || lowerSummary.includes('shared')) {
            const match = summary.match(/posted about|shared insights on|commented on/i);
            if (match) {
                return summary.substring(summary.indexOf(match[0]));
            }
        }
        
        // Default: return first 100 characters
        return summary.substring(0, 100) + (summary.length > 100 ? '...' : '');
    }

    extractTopic(summary) {
        // Extract the main topic from activity summary
        const topics = [
            'hybrid workspaces',
            'office tower transaction',
            'industrial sector',
            'retail expansion',
            'sustainability initiative',
            'market expansion',
            'partnership',
            'capital markets',
            'transaction volume',
            'ESG metrics'
        ];

        const lowerSummary = summary.toLowerCase();
        
        for (const topic of topics) {
            if (lowerSummary.includes(topic)) {
                return topic;
            }
        }

        // Default: extract key phrase
        const words = summary.split(' ');
        if (words.length > 5) {
            return words.slice(2, 7).join(' ');
        }
        
        return 'your recent activity';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============================================
    // Batch Generation
    // ============================================

    async generateBatchIcebreakers(contactIds) {
        if (this.isGenerating) {
            showToast('Generation already in progress', 'info');
            return;
        }

        const settings = window.SettingsModel ? window.SettingsModel.load() : { use_live_ai: false };
        const useLiveAI = settings.use_live_ai;

        showToast(`Starting icebreaker generation for ${contactIds.length} contacts...${useLiveAI ? ' (Live AI with rate limiting)' : ''}`, 'info');

        // If using Live AI, use queue to prevent rate limits
        if (useLiveAI && window.TaskQueue) {
            const queue = new window.TaskQueue(2, 1000); // 2 concurrent, 1 second delay
            
            const tasks = contactIds.map(contactId => async () => {
                await this.generateIcebreakers(contactId);
            });
            
            try {
                await queue.pushAll(tasks);
                showToast(`Batch generation complete! ${contactIds.length} contacts processed with Live AI.`, 'success');
            } catch (error) {
                console.error('[IcebreakerEngine] Batch generation error:', error);
                showToast(`Batch generation completed with some errors. Check console for details.`, 'warning');
            }
        } else {
            // Simulation mode - sequential processing
            for (const contactId of contactIds) {
                await this.generateIcebreakers(contactId);
                await this.sleep(500); // Small delay between contacts
            }
            
            showToast(`Batch generation complete! ${contactIds.length} contacts processed.`, 'success');
        }
    }
}

// Export for global access
window.IcebreakerEngine = IcebreakerEngine;