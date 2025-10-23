// ============================================
// Research UI - Approval Interface Management
// Handles display and interaction with research results
// ============================================

class ResearchUI {
    constructor(contactManager, researchEngine) {
        this.contactManager = contactManager;
        this.researchEngine = researchEngine;
        this.expandedCards = new Set();
        
        this.initEventListeners();
    }

    // ============================================
    // Event Listeners
    // ============================================

    initEventListeners() {
        // Feedback modal close
        document.getElementById('close-feedback-modal')?.addEventListener('click', () => this.closeFeedbackModal());
        document.getElementById('cancel-feedback-btn')?.addEventListener('click', () => this.closeFeedbackModal());
        
        // Feedback form submit
        document.getElementById('feedback-form')?.addEventListener('submit', (e) => this.handleFeedbackSubmit(e));
        
        // Close modal on background click
        document.getElementById('feedback-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'feedback-modal') {
                this.closeFeedbackModal();
            }
        });
    }

    // ============================================
    // Approval Section Rendering
    // ============================================

    renderApprovalSection() {
        const approvalContainer = document.getElementById('approval-section');
        
        if (!approvalContainer) return;

        // Get contacts awaiting approval and approved contacts
        const awaitingApproval = this.contactManager.getContactsByStatus('research_complete');
        const approvedContacts = this.contactManager.getContactsByStatus('approved');

        if (awaitingApproval.length === 0 && approvedContacts.length === 0) {
            approvalContainer.style.display = 'none';
            return;
        }

        approvalContainer.style.display = 'block';
        
        let html = '';
        
        // Awaiting Approval Section
        if (awaitingApproval.length > 0) {
            html += this.createApprovalSectionHTML(awaitingApproval);
        }
        
        // Approved Contacts Section (Ready for Icebreaker Generation)
        if (approvedContacts.length > 0) {
            html += this.createApprovedSectionHTML(approvedContacts);
        }
        
        approvalContainer.innerHTML = html;

        // Add event listeners to approval cards
        this.attachApprovalCardListeners();
        this.attachGenerateListeners();
    }

    createApprovalSectionHTML(contacts) {
        return `
            <div class="approval-header">
                <div class="approval-header-content">
                    <i class="fas fa-clipboard-check"></i>
                    <div>
                        <h3>Awaiting Approval</h3>
                        <p>Review and approve research results (${contacts.length} pending)</p>
                    </div>
                </div>
            </div>
            
            <div class="approval-cards">
                ${contacts.map(contact => this.createApprovalCardHTML(contact)).join('')}
            </div>
        `;
    }

    createApprovedSectionHTML(contacts) {
        return `
            <div class="approved-header" style="margin-top: 24px;">
                <div class="approval-header-content">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h3>Ready for Icebreakers</h3>
                        <p>Generate personalized icebreakers (${contacts.length} approved)</p>
                    </div>
                </div>
            </div>
            
            <div class="approval-cards">
                ${contacts.map(contact => this.createApprovedCardHTML(contact)).join('')}
            </div>
        `;
    }

    createApprovedCardHTML(contact) {
        const activityDate = contact.activity_date ? this.formatDate(contact.activity_date) : 'Recently';
        
        return `
            <div class="approval-card approved-card" data-contact-id="${contact.id}">
                <div class="approval-card-header">
                    <div class="approval-contact-info">
                        <h4>${this.escapeHtml(contact.full_name)}</h4>
                        <p class="approval-contact-meta">
                            ${this.escapeHtml(contact.job_title || 'No title')} at ${this.escapeHtml(contact.company)}
                        </p>
                    </div>
                    <span class="status-badge status-approved">
                        <i class="fas fa-check"></i> Approved
                    </span>
                </div>

                <div class="approval-activity">
                    <div class="activity-header">
                        <h5>Approved Activity</h5>
                        <span class="activity-type-badge activity-type-${contact.activity_type}">
                            ${this.getActivityTypeLabel(contact.activity_type)}
                        </span>
                    </div>
                    <p class="activity-summary">${this.escapeHtml(contact.activity_summary || 'No summary available')}</p>
                    <div class="activity-meta">
                        <span class="activity-date">
                            <i class="fas fa-calendar"></i>
                            ${activityDate}
                        </span>
                    </div>
                </div>

                <div class="approval-actions">
                    <button class="btn btn-primary btn-generate" data-contact-id="${contact.id}">
                        <i class="fas fa-magic"></i>
                        <span class="btn-text">Generate Icebreakers</span>
                        <span class="spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </span>
                    </button>
                </div>
            </div>
        `;
    }

    createApprovalCardHTML(contact) {
        const isExpanded = this.expandedCards.has(contact.id);
        const activityDate = contact.activity_date ? this.formatDate(contact.activity_date) : 'Recently';
        
        return `
            <div class="approval-card" data-contact-id="${contact.id}">
                <div class="approval-card-header">
                    <div class="approval-contact-info">
                        <h4>${this.escapeHtml(contact.full_name)}</h4>
                        <p class="approval-contact-meta">
                            ${this.escapeHtml(contact.job_title || 'No title')} at ${this.escapeHtml(contact.company)}
                        </p>
                    </div>
                    <button class="expand-btn" data-contact-id="${contact.id}">
                        <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}"></i>
                    </button>
                </div>

                ${isExpanded ? this.createExpandedDetailsHTML(contact) : ''}

                <div class="approval-activity">
                    <div class="activity-header">
                        <h5>Found Activity</h5>
                        <span class="activity-type-badge activity-type-${contact.activity_type}">
                            ${this.getActivityTypeLabel(contact.activity_type)}
                        </span>
                    </div>
                    <p class="activity-summary">${this.escapeHtml(contact.activity_summary || 'No summary available')}</p>
                    <div class="activity-meta">
                        <span class="activity-date">
                            <i class="fas fa-calendar"></i>
                            ${activityDate}
                        </span>
                        <a href="${contact.source_url || '#'}" target="_blank" class="activity-source">
                            <i class="fas fa-external-link-alt"></i>
                            View Source
                        </a>
                    </div>
                </div>

                <div class="approval-actions">
                    <button class="btn btn-success" onclick="researchUI.approveResearch('${contact.id}')">
                        <i class="fas fa-check"></i>
                        Approve & Continue
                    </button>
                    <button class="btn btn-warning" onclick="researchUI.handleOutdated('${contact.id}')">
                        <i class="fas fa-clock"></i>
                        Outdated
                    </button>
                    <button class="btn btn-outline-danger" onclick="researchUI.openFeedbackModal('${contact.id}')">
                        <i class="fas fa-exclamation-circle"></i>
                        Other Issue
                    </button>
                    <button class="btn btn-secondary" onclick="researchUI.rejectResearch('${contact.id}')">
                        <i class="fas fa-times"></i>
                        Reject
                    </button>
                </div>
            </div>
        `;
    }

    createExpandedDetailsHTML(contact) {
        return `
            <div class="approval-card-details">
                <div class="detail-row">
                    <div class="detail-item">
                        <label>Contact Location</label>
                        <span>${this.escapeHtml(contact.contact_location || 'Not specified')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Company Location</label>
                        <span>${this.escapeHtml(contact.company_location || 'Not specified')}</span>
                    </div>
                </div>
                
                ${contact.personal_linkedin_url ? `
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <label>Personal LinkedIn</label>
                            <a href="${contact.personal_linkedin_url}" target="_blank" class="detail-link">
                                <i class="fab fa-linkedin"></i>
                                ${contact.personal_linkedin_url}
                            </a>
                        </div>
                    </div>
                ` : ''}
                
                ${contact.company_linkedin_url ? `
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <label>Company LinkedIn</label>
                            <a href="${contact.company_linkedin_url}" target="_blank" class="detail-link">
                                <i class="fab fa-linkedin"></i>
                                ${contact.company_linkedin_url}
                            </a>
                        </div>
                    </div>
                ` : ''}
                
                ${contact.company_website ? `
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <label>Company Website</label>
                            <a href="${contact.company_website}" target="_blank" class="detail-link">
                                <i class="fas fa-globe"></i>
                                ${contact.company_website}
                            </a>
                        </div>
                    </div>
                ` : ''}
                
                ${contact.notes ? `
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <label>Notes</label>
                            <p class="detail-notes">${this.escapeHtml(contact.notes)}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ============================================
    // Event Handlers
    // ============================================

    attachApprovalCardListeners() {
        // Expand/collapse buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contactId = e.currentTarget.dataset.contactId;
                this.toggleCardExpansion(contactId);
            });
        });
    }

    attachGenerateListeners() {
        // Generate icebreaker buttons
        document.querySelectorAll('.btn-generate').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.currentTarget;
                const contactId = button.dataset.contactId;
                
                // Disable button and show spinner
                button.disabled = true;
                button.querySelector('.btn-text').style.display = 'none';
                button.querySelector('.spinner').style.display = 'inline-block';
                
                // Generate icebreakers
                if (window.icebreakerEngine) {
                    await window.icebreakerEngine.generateIcebreakers(contactId);
                } else {
                    showToast('Icebreaker engine not initialized', 'error');
                }
                
                // Re-render to remove from approved section
                this.renderApprovalSection();
            });
        });
    }

    toggleCardExpansion(contactId) {
        if (this.expandedCards.has(contactId)) {
            this.expandedCards.delete(contactId);
        } else {
            this.expandedCards.add(contactId);
        }
        
        this.renderApprovalSection();
    }

    // ============================================
    // Approval Actions
    // ============================================

    approveResearch(contactId) {
        this.researchEngine.approveResearch(contactId);
    }

    rejectResearch(contactId) {
        const contact = this.contactManager.getContactById(contactId);
        if (!contact) return;

        if (confirm(`Reject research for ${contact.full_name}? This will mark the contact as having no activity found.`)) {
            this.researchEngine.rejectResearch(contactId);
        }
    }

    handleOutdated(contactId) {
        const contact = this.contactManager.getContactById(contactId);
        if (!contact) return;

        showToast('This activity appears too old. Searching for newer results...', 'info');
        
        // Re-research with "newer data" context
        setTimeout(() => {
            this.researchEngine.reResearch(contactId, 'User requested newer activity. Search for more recent results.');
        }, 500);
    }

    // ============================================
    // Feedback Modal
    // ============================================

    openFeedbackModal(contactId) {
        this.currentFeedbackContactId = contactId;
        const contact = this.contactManager.getContactById(contactId);
        
        if (!contact) return;

        const modal = document.getElementById('feedback-modal');
        const contactName = document.getElementById('feedback-contact-name');
        
        if (modal && contactName) {
            contactName.textContent = contact.full_name;
            modal.style.display = 'flex';
        }
    }

    closeFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        const form = document.getElementById('feedback-form');
        
        if (modal) modal.style.display = 'none';
        if (form) form.reset();
        
        this.currentFeedbackContactId = null;
    }

    handleFeedbackSubmit(e) {
        e.preventDefault();
        
        const feedback = document.getElementById('feedback-text').value;
        
        if (!feedback || !this.currentFeedbackContactId) {
            showToast('Please provide feedback details', 'error');
            return;
        }

        const contact = this.contactManager.getContactById(this.currentFeedbackContactId);
        
        if (!contact) return;

        this.closeFeedbackModal();
        
        showToast(`Re-researching ${contact.full_name} with your feedback...`, 'info');
        
        // Re-research with user feedback
        setTimeout(() => {
            this.researchEngine.reResearch(this.currentFeedbackContactId, feedback);
        }, 500);
    }

    // ============================================
    // Utility Functions
    // ============================================

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getActivityTypeLabel(type) {
        const labels = {
            'recent_activity': 'Recent Activity',
            'volunteer_connection': 'Volunteer Connection',
            'alumni_connection': 'Alumni Connection',
            'company_research': 'Company Research'
        };
        return labels[type] || type;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for global access
window.ResearchUI = ResearchUI;