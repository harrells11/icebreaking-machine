/**
 * Credit Tracker
 * Tracks monthly Genspark credit usage for the Icebreaker Engine
 * Auto-resets on the 23rd of each month
 */

class CreditTracker {
    constructor() {
        this.storageKey = 'icebreaking_credits';
        this.resetDay = 23; // Day of month to reset
        this.init();
    }

    /**
     * Initialize credit tracker
     * Load from storage and check if reset is needed
     */
    init() {
        this.resetIfNeeded();
        return this.getUsage();
    }

    /**
     * Get current credit usage data
     * @returns {Object} { month, count, reset_day, next_reset }
     */
    getUsage() {
        const data = this.loadFromStorage();
        const nextReset = this.calculateNextReset();
        
        return {
            month: data.month,
            count: data.count,
            reset_day: data.reset_day,
            next_reset: nextReset
        };
    }

    /**
     * Increment credit usage
     * @param {number} amount - Number of credits to add (default: 1)
     * @returns {number} New credit count
     */
    increment(amount = 1) {
        // Check if reset is needed before incrementing
        this.resetIfNeeded();
        
        const data = this.loadFromStorage();
        data.count += amount;
        data.updated_at = new Date().toISOString();
        
        this.saveToStorage(data);
        
        console.log(`[CreditTracker] Incremented by ${amount}. New count: ${data.count}`);
        
        return data.count;
    }

    /**
     * Check if reset is needed and perform reset if necessary
     * Reset occurs on the 23rd of each month
     */
    resetIfNeeded() {
        const data = this.loadFromStorage();
        const now = new Date();
        const currentMonth = this.getMonthKey(now);
        
        // If month has changed and we're on or past the reset day, reset
        if (data.month !== currentMonth && now.getDate() >= this.resetDay) {
            console.log(`[CreditTracker] Resetting credits for new month: ${currentMonth}`);
            this.reset(currentMonth);
        }
        // If we're in the same month but past reset day and count was from previous cycle
        else if (data.month === currentMonth && this.shouldResetInCurrentMonth(data.last_reset, now)) {
            console.log(`[CreditTracker] Resetting credits within current month`);
            this.reset(currentMonth);
        }
    }

    /**
     * Check if reset should occur within current month
     * @param {string} lastReset - ISO date of last reset
     * @param {Date} now - Current date
     * @returns {boolean}
     */
    shouldResetInCurrentMonth(lastReset, now) {
        if (!lastReset) return false;
        
        const lastResetDate = new Date(lastReset);
        const currentDay = now.getDate();
        const lastResetDay = lastResetDate.getDate();
        
        // If we're past reset day and last reset was before reset day this month
        return currentDay >= this.resetDay && lastResetDay < this.resetDay;
    }

    /**
     * Reset credit count to zero
     * @param {string} month - Month key (YYYY-MM format)
     */
    reset(month = null) {
        const now = new Date();
        const monthKey = month || this.getMonthKey(now);
        
        const data = {
            month: monthKey,
            count: 0,
            reset_day: this.resetDay,
            last_reset: now.toISOString(),
            created_at: now.toISOString(),
            updated_at: now.toISOString()
        };
        
        this.saveToStorage(data);
        console.log(`[CreditTracker] Credits reset for ${monthKey}`);
    }

    /**
     * Calculate next reset date
     * @returns {string} Formatted date string (e.g., "October 23, 2025")
     */
    calculateNextReset() {
        const now = new Date();
        const currentDay = now.getDate();
        
        let resetDate;
        if (currentDay < this.resetDay) {
            // Next reset is this month
            resetDate = new Date(now.getFullYear(), now.getMonth(), this.resetDay);
        } else {
            // Next reset is next month
            resetDate = new Date(now.getFullYear(), now.getMonth() + 1, this.resetDay);
        }
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return resetDate.toLocaleDateString('en-US', options);
    }

    /**
     * Get month key in YYYY-MM format
     * @param {Date} date - Date object
     * @returns {string} Month key
     */
    getMonthKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    /**
     * Load credit data from localStorage
     * @returns {Object} Credit data
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('[CreditTracker] Error loading from storage:', error);
        }
        
        // Return default data if nothing stored
        const now = new Date();
        return {
            month: this.getMonthKey(now),
            count: 0,
            reset_day: this.resetDay,
            last_reset: now.toISOString(),
            created_at: now.toISOString(),
            updated_at: now.toISOString()
        };
    }

    /**
     * Save credit data to localStorage
     * @param {Object} data - Credit data to save
     */
    saveToStorage(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('[CreditTracker] Error saving to storage:', error);
        }
    }

    /**
     * Get credit usage history (for future analytics)
     * @returns {Array} Array of monthly usage records
     */
    getHistory() {
        try {
            const historyKey = 'icebreaking_credits_history';
            const stored = localStorage.getItem(historyKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[CreditTracker] Error loading history:', error);
            return [];
        }
    }

    /**
     * Archive current month's usage to history
     */
    archiveCurrentMonth() {
        const current = this.loadFromStorage();
        const history = this.getHistory();
        
        // Add current month to history if count > 0
        if (current.count > 0) {
            history.push({
                month: current.month,
                count: current.count,
                archived_at: new Date().toISOString()
            });
            
            try {
                const historyKey = 'icebreaking_credits_history';
                localStorage.setItem(historyKey, JSON.stringify(history));
            } catch (error) {
                console.error('[CreditTracker] Error archiving history:', error);
            }
        }
    }

    /**
     * Manual reset (for testing or admin purposes)
     */
    manualReset() {
        this.archiveCurrentMonth();
        this.reset();
        console.log('[CreditTracker] Manual reset completed');
    }

    /**
     * Get statistics
     * @returns {Object} Usage statistics
     */
    getStatistics() {
        const current = this.getUsage();
        const history = this.getHistory();
        
        const totalAllTime = history.reduce((sum, record) => sum + record.count, 0) + current.count;
        const averagePerMonth = history.length > 0 
            ? (totalAllTime / (history.length + 1)).toFixed(1)
            : current.count;
        
        return {
            current_month: current.count,
            total_all_time: totalAllTime,
            average_per_month: parseFloat(averagePerMonth),
            months_tracked: history.length + 1,
            next_reset: current.next_reset
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CreditTracker;
}
