/**
 * Prompt Builder
 * Builds AI prompts with placeholder replacement using contact data and settings
 */

/**
 * Build an icebreaker generation prompt
 * @param {Object} contact - Contact object with research data
 * @returns {string} Complete prompt for AI generation
 */
function buildIcebreakerPrompt(contact) {
    const settings = window.SettingsModel ? window.SettingsModel.load() : {};
    
    // Get settings with defaults
    const style = settings.writing_style_guide || "Professional, confident, approachable. Short sentences (10–16 words).";
    const banned = (settings.banned_phrases || []).join(", ");
    const approved = (settings.approved_phrases || []).join(", ");
    const customPrompt = (settings.icebreaker_prompt || "").trim();

    // If user has a custom template, use it with placeholder replacement
    if (customPrompt) {
        return replacePlaceholders(customPrompt, contact, {
            writing_style_guide: style,
            banned_phrases: banned,
            approved_phrases: approved
        });
    }

    // Default prompt if no custom template
    return buildDefaultIcebreakerPrompt(contact, style, banned, approved);
}

/**
 * Build default icebreaker prompt
 * @param {Object} contact - Contact data
 * @param {string} style - Writing style guide
 * @param {string} banned - Banned phrases (comma-separated)
 * @param {string} approved - Approved phrases (comma-separated)
 * @returns {string} Default prompt
 */
function buildDefaultIcebreakerPrompt(contact, style, banned, approved) {
    return `You write brief, verified outreach openers for commercial real estate contacts.

WRITING STYLE GUIDE:
${style}

PHRASE GUIDELINES:
- Avoid these phrases: ${banned || "none specified"}
- Good patterns to emulate: ${approved || "none specified"}

CONTACT INFORMATION:
- Name: ${contact.full_name || "Unknown"}
- Title: ${contact.job_title || "Not specified"}
- Company: ${contact.company || "Unknown"}
- Research Summary: ${contact.activity_summary || "No research available"}
- Activity Date: ${contact.activity_date || "Not specified"}
- Activity Type: ${contact.activity_type || "Not specified"}
- Source: ${contact.source_url || "Not specified"}

TASK:
Write TWO distinct icebreakers (A and B) for this contact, each 1–2 sentences maximum.
Each must reference the specific research above.
Sound natural and professional. No sales tone. No excessive flattery.

Return ONLY plain text in this exact format:
A: <your first icebreaker here>
B: <your second icebreaker here>

Do not include any other text, explanations, or formatting.`.trim();
}

/**
 * Replace all placeholders in a template string
 * @param {string} template - Template string with {placeholders}
 * @param {Object} contact - Contact data
 * @param {Object} extras - Extra values (style guide, phrases)
 * @returns {string} Template with placeholders replaced
 */
function replacePlaceholders(template, contact, extras = {}) {
    let result = template;
    
    // Contact placeholders
    const contactPlaceholders = {
        '{full_name}': contact.full_name || '',
        '{first_name}': (contact.full_name || '').split(' ')[0] || '',
        '{last_name}': (contact.full_name || '').split(' ').slice(1).join(' ') || '',
        '{company}': contact.company || '',
        '{job_title}': contact.job_title || '',
        '{contact_location}': contact.contact_location || '',
        '{company_location}': contact.company_location || '',
        '{activity_summary}': contact.activity_summary || '',
        '{activity_date}': contact.activity_date || '',
        '{activity_type}': contact.activity_type || '',
        '{source_url}': contact.source_url || '',
        '{personal_linkedin_url}': contact.personal_linkedin_url || '',
        '{company_linkedin_url}': contact.company_linkedin_url || '',
        '{company_website}': contact.company_website || '',
        '{notes}': contact.notes || ''
    };
    
    // Extra placeholders (settings)
    const extraPlaceholders = {
        '{writing_style_guide}': extras.writing_style_guide || '',
        '{banned_phrases}': extras.banned_phrases || '',
        '{approved_phrases}': extras.approved_phrases || '',
        '{alma_mater}': extras.alma_mater || '',
        '{event_timeframe_days}': extras.event_timeframe_days || '120',
        '{personal_notes}': extras.personal_notes || '',
        '{personal_interests}': extras.personal_interests || ''
    };
    
    // Replace all placeholders
    const allPlaceholders = { ...contactPlaceholders, ...extraPlaceholders };
    
    for (const [placeholder, value] of Object.entries(allPlaceholders)) {
        // Use replaceAll to replace all occurrences
        result = result.split(placeholder).join(value);
    }
    
    return result;
}

/**
 * Build a research prompt (for future use)
 * @param {Object} contact - Contact object
 * @returns {string} Research prompt
 */
function buildResearchPrompt(contact) {
    const settings = window.SettingsModel ? window.SettingsModel.load() : {};
    const customPrompt = (settings.research_prompt || "").trim();
    
    if (customPrompt) {
        return replacePlaceholders(customPrompt, contact, {
            alma_mater: settings.alma_mater || '',
            event_timeframe_days: settings.event_timeframe_days || '120',
            personal_notes: settings.personal_notes || '',
            personal_interests: settings.personal_interests || ''
        });
    }

    // Default research prompt
    return `Research contact: ${contact.full_name} at ${contact.company}.
Find recent LinkedIn activity, company news, or shared connections from the last ${settings.event_timeframe_days || 120} days.`;
}

/**
 * Parse AI response to extract icebreaker A and B
 * @param {string} text - Raw AI response text
 * @returns {Object} { icebreaker_a, icebreaker_b }
 */
function parseIcebreakerResponse(text) {
    if (!text) {
        return {
            icebreaker_a: '',
            icebreaker_b: ''
        };
    }

    // Try to extract "A: ..." and "B: ..." format
    const aMatch = text.match(/A:\s*([\s\S]*?)(?=\nB:|$)/i);
    const bMatch = text.match(/B:\s*([\s\S]*?)$/i);

    let icebreaker_a = aMatch ? aMatch[1].trim() : '';
    let icebreaker_b = bMatch ? bMatch[1].trim() : '';

    // Fallback: if no A:/B: format, split by newline
    if (!icebreaker_a && !icebreaker_b) {
        const lines = text.split('\n').filter(line => line.trim());
        icebreaker_a = lines[0]?.trim() || text.slice(0, 200).trim();
        icebreaker_b = lines[1]?.trim() || text.slice(200).trim() || lines[0]?.trim() || '';
    }

    // Clean up any remaining formatting
    icebreaker_a = icebreaker_a.replace(/^["']|["']$/g, '').trim();
    icebreaker_b = icebreaker_b.replace(/^["']|["']$/g, '').trim();

    return {
        icebreaker_a,
        icebreaker_b
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        buildIcebreakerPrompt,
        buildResearchPrompt,
        parseIcebreakerResponse,
        replacePlaceholders
    };
}
