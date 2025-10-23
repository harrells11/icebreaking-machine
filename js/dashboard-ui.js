/**
 * Dashboard UI
 * Manages the Dashboard page display including statistics cards
 */

class DashboardUI {
    constructor(contactManager, creditTracker) {
        this.contactManager = contactManager;
        this.creditTracker = creditTracker;
    }

    /**
     * Render the complete dashboard
     */
    renderDashboard() {
        this.renderStats();
        this.renderRecentResearch();
    }

    /**
     * Render statistics cards
     */
    renderStats() {
        const stats = this.contactManager.getStatistics();
        const creditUsage = this.creditTracker.getUsage();

        const statsData = [
            {
                label: 'Total Contacts',
                value: stats.total,
                icon: 'fa-users',
                color: 'blue'
            },
            {
                label: 'Research Completed',
                value: stats.completed,
                icon: 'fa-check-circle',
                color: 'green'
            },
            {
                label: 'Pending Research',
                value: stats.pending,
                icon: 'fa-clock',
                color: 'orange'
            },
            {
                label: 'Success Rate',
                value: stats.successRate,
                icon: 'fa-chart-line',
                color: 'teal'
            },
            {
                label: 'Credits Used',
                value: creditUsage.count,
                icon: 'fa-bolt',
                color: 'purple',
                subtext: `Resets ${this.formatResetDate(creditUsage.next_reset)}`
            }
        ];

        const statsHTML = statsData.map(stat => this.createStatCard(stat)).join('');
        
        const statsGrid = document.getElementById('stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = statsHTML;
        }
    }

    /**
     * Create a single stat card
     * @param {Object} stat - Stat data
     * @returns {string} HTML string
     */
    createStatCard(stat) {
        const subtextHTML = stat.subtext 
            ? `<div class="stat-subtext">${stat.subtext}</div>` 
            : '';

        return `
            <div class="stat-card ${stat.color}">
                <div class="stat-icon">
                    <i class="fas ${stat.icon}"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-value">${stat.value}</div>
                    ${subtextHTML}
                </div>
            </div>
        `;
    }

    /**
     * Format reset date for display
     * @param {string} resetDate - Reset date string
     * @returns {string} Formatted date
     */
    formatResetDate(resetDate) {
        // Convert "October 23, 2025" to "on Oct 23"
        try {
            const date = new Date(resetDate);
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            const day = date.getDate();
            return `on ${month} ${day}`;
        } catch (error) {
            return resetDate;
        }
    }

    /**
     * Render recent research section
     */
    renderRecentResearch() {
        const allContacts = this.contactManager.getAllContacts();
        
        // Get completed contacts, sorted by most recent
        const completedContacts = allContacts
            .filter(c => c.research_status === 'completed')
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 5); // Latest 5

        const container = document.getElementById('recent-research-list');
        if (!container) return;

        if (completedContacts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No completed research yet</p>
                </div>
            `;
            return;
        }

        const itemsHTML = completedContacts.map(contact => this.createRecentResearchItem(contact)).join('');
        container.innerHTML = itemsHTML;
    }

    /**
     * Create a recent research item
     * @param {Object} contact - Contact object
     * @returns {string} HTML string
     */
    createRecentResearchItem(contact) {
        const timeAgo = this.getTimeAgo(contact.updated_at);
        const activitySummary = contact.activity_summary 
            ? contact.activity_summary.substring(0, 100) + (contact.activity_summary.length > 100 ? '...' : '')
            : 'No activity summary';

        return `
            <div class="research-item">
                <div class="research-avatar">
                    ${this.getInitials(contact.name)}
                </div>
                <div class="research-info">
                    <div class="research-header">
                        <span class="research-name">${contact.name}</span>
                        <span class="research-time">${timeAgo}</span>
                    </div>
                    <div class="research-company">${contact.company}</div>
                    <div class="research-summary">${activitySummary}</div>
                </div>
            </div>
        `;
    }

    /**
     * Get initials from name
     * @param {string} name - Full name
     * @returns {string} Initials (max 2 chars)
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    /**
     * Calculate time ago from timestamp
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Human-readable time ago
     */
    getTimeAgo(timestamp) {
        if (!timestamp) return 'Recently';
        
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    /**
     * Update dashboard (called when data changes)
     */
    updateDashboard() {
        this.renderDashboard();
    }

    /**
     * Animate stat card values (optional enhancement)
     * @param {HTMLElement} element - Stat value element
     * @param {number} endValue - Target value
     */
    animateValue(element, endValue) {
        const duration = 1000; // 1 second
        const startValue = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardUI;
}
