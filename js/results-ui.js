// ============================================
// Results Library UI
// Displays and manages completed research results
// ============================================

class ResultsLibraryUI {
    constructor(contactManager) {
        this.contactManager = contactManager;
        this.currentFilter = '';
        this.copiedButtons = new Set();
        
        this.initEventListeners();
    }

    // ============================================
    // Event Listeners
    // ============================================

    initEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-results');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilter = e.target.value;
                this.renderResultsLibrary();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }
    }

    // ============================================
    // Main Render Method
    // ============================================

    renderResultsLibrary() {
        const resultsContainer = document.getElementById('results-table');
        
        if (!resultsContainer) return;

        // Get completed contacts
        let completedContacts = this.contactManager.getContactsByStatus('completed');

        // Apply search filter
        if (this.currentFilter) {
            const filterLower = this.currentFilter.toLowerCase();
            completedContacts = completedContacts.filter(contact => 
                contact.full_name.toLowerCase().includes(filterLower) ||
                contact.company.toLowerCase().includes(filterLower) ||
                (contact.activity_summary && contact.activity_summary.toLowerCase().includes(filterLower))
            );
        }

        // Update count
        this.updateResultsCount(completedContacts.length);

        // Render table
        if (completedContacts.length === 0) {
            resultsContainer.innerHTML = this.renderEmptyState();
        } else {
            resultsContainer.innerHTML = this.renderResultsTable(completedContacts);
            this.attachCopyListeners();
        }
    }

    renderResultsTable(contacts) {
        return `
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Contact</th>
                        <th>Activity Summary</th>
                        <th>Date</th>
                        <th>Icebreaker A</th>
                        <th>Icebreaker B</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody>
                    ${contacts.map(contact => this.renderResultRow(contact)).join('')}
                </tbody>
            </table>
        `;
    }

    renderResultRow(contact) {
        const activityDate = contact.activity_date ? this.formatDate(contact.activity_date) : '-';
        const activitySummary = this.truncateText(contact.activity_summary || 'No summary', 80);
        
        return `
            <tr>
                <td>
                    <div class="contact-cell">
                        <div class="contact-name-company">
                            <strong>${this.escapeHtml(contact.full_name)}</strong>
                            <div class="company-name">${this.escapeHtml(contact.company)}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="activity-summary-cell" title="${this.escapeHtml(contact.activity_summary || '')}">
                        ${this.escapeHtml(activitySummary)}
                    </div>
                </td>
                <td>${activityDate}</td>
                <td>
                    <div class="icebreaker-cell">
                        <div class="icebreaker-text">${this.escapeHtml(contact.icebreaker_a || 'Not generated')}</div>
                        ${contact.icebreaker_a ? this.renderIcebreakerActions(contact.id, 'a') : ''}
                    </div>
                </td>
                <td>
                    <div class="icebreaker-cell">
                        <div class="icebreaker-text">${this.escapeHtml(contact.icebreaker_b || 'Not generated')}</div>
                        ${contact.icebreaker_b ? this.renderIcebreakerActions(contact.id, 'b') : ''}
                    </div>
                </td>
                <td>
                    ${contact.source_url ? `
                        <a href="${contact.source_url}" target="_blank" class="source-link" title="View source">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : '-'}
                </td>
            </tr>
        `;
    }

    renderIcebreakerActions(contactId, variant) {
        const buttonId = `copy-${contactId}-${variant}`;
        const isCopied = this.copiedButtons.has(buttonId);
        
        return `
            <div class="icebreaker-actions">
                <button 
                    class="btn-copy ${isCopied ? 'copied' : ''}" 
                    data-contact-id="${contactId}" 
                    data-variant="${variant}"
                    id="${buttonId}">
                    <i class="fas ${isCopied ? 'fa-check' : 'fa-copy'}"></i>
                    ${isCopied ? 'Copied' : 'Copy'}
                </button>
                <button 
                    class="btn-feedback" 
                    data-contact-id="${contactId}" 
                    data-variant="${variant}"
                    title="Rate this icebreaker">
                    <i class="fas fa-comment-dots"></i>
                    Feedback
                </button>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state-results">
                <i class="fas fa-folder-open fa-3x"></i>
                <h3>No Completed Results Yet</h3>
                <p>Complete the research and icebreaker generation process to see results here.</p>
                ${this.currentFilter ? `
                    <button class="btn btn-secondary" onclick="resultsUI.clearFilter()">
                        Clear Search Filter
                    </button>
                ` : ''}
            </div>
        `;
    }

    // ============================================
    // Copy Functionality
    // ============================================

    attachCopyListeners() {
        // Copy buttons
        const copyButtons = document.querySelectorAll('.btn-copy');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const contactId = button.dataset.contactId;
                const variant = button.dataset.variant;
                this.copyIcebreaker(contactId, variant, button.id);
            });
        });

        // Feedback buttons
        const feedbackButtons = document.querySelectorAll('.btn-feedback');
        feedbackButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const contactId = button.dataset.contactId;
                const variant = button.dataset.variant;
                this.openFeedbackModal(contactId, variant);
            });
        });
    }

    async copyIcebreaker(contactId, variant, buttonId) {
        const contact = this.contactManager.getContactById(contactId);
        
        if (!contact) return;

        const text = variant === 'a' ? contact.icebreaker_a : contact.icebreaker_b;
        
        if (!text) {
            showToast('No icebreaker to copy', 'error');
            return;
        }

        try {
            // Use Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            // Update button state
            this.copiedButtons.add(buttonId);
            this.renderResultsLibrary();

            // Reset after 2 seconds
            setTimeout(() => {
                this.copiedButtons.delete(buttonId);
                this.renderResultsLibrary();
            }, 2000);

            showToast('Icebreaker copied to clipboard!', 'success');
        } catch (err) {
            console.error('Copy failed:', err);
            showToast('Failed to copy to clipboard', 'error');
        }
    }

    // ============================================
    // Feedback Functionality
    // ============================================

    openFeedbackModal(contactId, variant) {
        if (window.feedbackUI) {
            window.feedbackUI.showFeedbackModal(contactId, variant);
        } else {
            console.error('FeedbackUI not loaded');
            showToast('Feedback functionality not available', 'error');
        }
    }

    // ============================================
    // Export Functionality
    // ============================================

    handleExport() {
        if (window.ExportUtils) {
            ExportUtils.exportContactsByStatus(this.contactManager, 'completed');
        } else {
            console.error('ExportUtils not loaded');
            showToast('Export functionality not available', 'error');
        }
    }

    // ============================================
    // Utility Methods
    // ============================================

    updateResultsCount(count) {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = count;
        }

        // Update page subtitle
        const subtitle = document.querySelector('#results-library-page .page-subtitle');
        if (subtitle) {
            subtitle.textContent = count === 1 
                ? '1 completed contact' 
                : `${count} completed contacts`;
        }
    }

    clearFilter() {
        const searchInput = document.getElementById('search-results');
        if (searchInput) {
            searchInput.value = '';
            this.currentFilter = '';
            this.renderResultsLibrary();
        }
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for global access
window.ResultsLibraryUI = ResultsLibraryUI;