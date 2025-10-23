// ============================================
// Contact UI Management
// Handles all UI interactions for contact management
// ============================================

class ContactUI {
    constructor(contactManager) {
        this.contactManager = contactManager;
        this.selectedContacts = new Set();
        this.currentEditingId = null;
        
        this.initEventListeners();
    }

    // ============================================
    // Event Listeners Initialization
    // ============================================

    initEventListeners() {
        // Add Contact Button
        document.getElementById('add-contact-btn')?.addEventListener('click', () => this.openAddContactModal());
        document.getElementById('empty-add-contact-btn')?.addEventListener('click', () => this.openAddContactModal());
        
        // CSV Import Button
        document.getElementById('import-csv-btn')?.addEventListener('click', () => this.openCSVImportModal());
        
        // Contact Form
        document.getElementById('contact-form')?.addEventListener('submit', (e) => this.handleContactFormSubmit(e));
        document.getElementById('cancel-contact-btn')?.addEventListener('click', () => this.closeContactModal());
        document.getElementById('close-contact-modal')?.addEventListener('click', () => this.closeContactModal());
        
        // CSV Import Modal
        document.getElementById('close-csv-modal')?.addEventListener('click', () => this.closeCSVModal());
        document.getElementById('browse-file-btn')?.addEventListener('click', () => document.getElementById('csv-file-input').click());
        document.getElementById('csv-file-input')?.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and Drop
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        }
        
        // Batch Operations
        document.getElementById('select-all')?.addEventListener('change', (e) => this.handleSelectAll(e));
        document.getElementById('batch-delete-btn')?.addEventListener('click', () => this.handleBatchDelete());
        
        // Close modal on background click
        document.getElementById('contact-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'contact-modal') {
                this.closeContactModal();
            }
        });
        
        document.getElementById('csv-import-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'csv-import-modal') {
                this.closeCSVModal();
            }
        });
    }

    // ============================================
    // Contact Display
    // ============================================

    renderContacts(contacts = null) {
        const contactsList = document.getElementById('contacts-list');
        const emptyState = document.getElementById('empty-state');
        
        if (!contactsList) return;
        
        const contactsToRender = contacts || this.contactManager.getAllContacts();
        
        if (contactsToRender.length === 0) {
            contactsList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        contactsList.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        contactsList.innerHTML = contactsToRender.map(contact => this.createContactCard(contact)).join('');
        
        // Add event listeners to checkboxes
        contactsList.querySelectorAll('.contact-select').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleContactSelect(e));
        });
    }

    createContactCard(contact) {
        const statusLabel = this.getStatusLabel(contact.research_status);
        const isChecked = this.selectedContacts.has(contact.id) ? 'checked' : '';
        
        return `
            <div class="contact-card" data-contact-id="${contact.id}">
                <div class="contact-checkbox">
                    <input type="checkbox" class="contact-select" value="${contact.id}" ${isChecked}>
                </div>
                
                <div class="contact-info">
                    <h3>${this.escapeHtml(contact.full_name)}</h3>
                    <p class="contact-title">${this.escapeHtml(contact.job_title || 'No title')}</p>
                    <p class="contact-company">${this.escapeHtml(contact.company)}</p>
                    
                    <span class="status-badge status-${contact.research_status}">
                        ${statusLabel}
                    </span>
                </div>
                
                <div class="contact-actions">
                    ${this.getResearchButton(contact)}
                    <button class="btn-icon" onclick="contactUI.editContact('${contact.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="contactUI.deleteContact('${contact.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getResearchButton(contact) {
        // Show Research button only for pending or no_activity statuses
        if (contact.research_status === 'pending' || contact.research_status === 'no_activity') {
            return `
                <button class="btn-icon btn-primary" onclick="contactUI.startResearch('${contact.id}')" title="Start Research">
                    <i class="fas fa-search"></i>
                </button>
            `;
        }
        
        // Show spinner for researching status
        if (contact.research_status === 'researching') {
            return `
                <button class="btn-icon btn-primary" disabled title="Researching...">
                    <i class="fas fa-spinner fa-spin"></i>
                </button>
            `;
        }
        
        // Don't show research button for other statuses
        return '';
    }

    startResearch(contactId) {
        if (window.researchEngine) {
            window.researchEngine.startResearch(contactId);
        } else {
            showToast('Research engine not initialized', 'error');
        }
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Pending',
            'researching': '<i class="fas fa-spinner fa-spin"></i> Researching',
            'research_complete': 'Review Needed',
            'approved': 'Approved',
            'icebreaker_generating': '<i class="fas fa-spinner fa-spin"></i> Generating',
            'completed': '<i class="fas fa-check"></i> Completed',
            'no_activity': 'No Activity Found'
        };
        
        return labels[status] || status;
    }

    // ============================================
    // Add/Edit Contact Modal
    // ============================================

    openAddContactModal() {
        const modal = document.getElementById('contact-modal');
        const form = document.getElementById('contact-form');
        const title = document.getElementById('modal-title');
        
        if (!modal || !form) return;
        
        this.currentEditingId = null;
        form.reset();
        title.textContent = 'Add Contact';
        modal.style.display = 'flex';
    }

    editContact(contactId) {
        const contact = this.contactManager.getContactById(contactId);
        if (!contact) return;
        
        const modal = document.getElementById('contact-modal');
        const form = document.getElementById('contact-form');
        const title = document.getElementById('modal-title');
        
        if (!modal || !form) return;
        
        this.currentEditingId = contactId;
        title.textContent = 'Edit Contact';
        
        // Populate form
        form.elements['full_name'].value = contact.full_name || '';
        form.elements['job_title'].value = contact.job_title || '';
        form.elements['company'].value = contact.company || '';
        form.elements['contact_location'].value = contact.contact_location || '';
        form.elements['company_location'].value = contact.company_location || '';
        form.elements['personal_linkedin_url'].value = contact.personal_linkedin_url || '';
        form.elements['company_linkedin_url'].value = contact.company_linkedin_url || '';
        form.elements['company_website'].value = contact.company_website || '';
        form.elements['notes'].value = contact.notes || '';
        
        modal.style.display = 'flex';
    }

    closeContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) modal.style.display = 'none';
        this.currentEditingId = null;
    }

    handleContactFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const contactData = Object.fromEntries(formData.entries());
        
        // Show loading state
        const saveBtn = document.getElementById('save-contact-btn');
        const btnText = saveBtn.querySelector('.btn-text');
        const spinner = saveBtn.querySelector('.spinner');
        
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block';
        saveBtn.disabled = true;
        
        // Simulate async operation
        setTimeout(() => {
            try {
                if (this.currentEditingId) {
                    // Update existing contact
                    this.contactManager.updateContact(this.currentEditingId, contactData);
                    showToast('Contact updated successfully!', 'success');
                } else {
                    // Create new contact
                    this.contactManager.createContact(contactData);
                    showToast('Contact added successfully!', 'success');
                }
                
                this.renderContacts();
                this.updateDashboardStats();
                this.closeContactModal();
                
            } catch (error) {
                console.error('Error saving contact:', error);
                showToast('Error saving contact. Please try again.', 'error');
            } finally {
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                saveBtn.disabled = false;
            }
        }, 500);
    }

    deleteContact(contactId) {
        const contact = this.contactManager.getContactById(contactId);
        if (!contact) return;
        
        if (confirm(`Delete ${contact.full_name}? This cannot be undone.`)) {
            this.contactManager.deleteContact(contactId);
            this.renderContacts();
            this.updateDashboardStats();
            showToast('Contact deleted successfully!', 'success');
        }
    }

    // ============================================
    // CSV Import
    // ============================================

    openCSVImportModal() {
        const modal = document.getElementById('csv-import-modal');
        if (!modal) return;
        
        // Reset modal state
        document.getElementById('drop-zone').style.display = 'block';
        document.getElementById('import-progress').style.display = 'none';
        document.getElementById('import-results').style.display = 'none';
        
        modal.style.display = 'flex';
    }

    closeCSVModal() {
        const modal = document.getElementById('csv-import-modal');
        if (modal) modal.style.display = 'none';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.closest('.drop-zone').classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.closest('.drop-zone').classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = e.target.closest('.drop-zone');
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processCSVFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processCSVFile(files[0]);
        }
    }

    processCSVFile(file) {
        if (!file.name.endsWith('.csv')) {
            showToast('Please select a CSV file', 'error');
            return;
        }
        
        // Hide drop zone, show progress
        document.getElementById('drop-zone').style.display = 'none';
        document.getElementById('import-progress').style.display = 'block';
        document.getElementById('import-status').textContent = 'Reading file...';
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const csvText = e.target.result;
            this.importFromCSV(csvText);
        };
        
        reader.onerror = () => {
            showToast('Error reading file', 'error');
            document.getElementById('drop-zone').style.display = 'block';
            document.getElementById('import-progress').style.display = 'none';
        };
        
        reader.readAsText(file);
    }

    importFromCSV(csvText) {
        // Update progress
        document.getElementById('import-status').textContent = 'Parsing CSV...';
        document.querySelector('.progress-fill').style.width = '25%';
        
        setTimeout(() => {
            // Parse CSV
            const parseResult = this.contactManager.parseCSV(csvText);
            
            document.getElementById('import-status').textContent = 'Importing contacts...';
            document.querySelector('.progress-fill').style.width = '50%';
            
            setTimeout(() => {
                // Import valid contacts
                const imported = this.contactManager.importContactsFromCSV(parseResult.valid);
                
                document.querySelector('.progress-fill').style.width = '100%';
                document.getElementById('import-status').textContent = 'Complete!';
                
                // Show results
                setTimeout(() => {
                    document.getElementById('import-progress').style.display = 'none';
                    document.getElementById('import-results').style.display = 'block';
                    
                    const successMsg = document.getElementById('success-message');
                    successMsg.textContent = `Imported ${imported.length} contacts successfully!`;
                    
                    if (parseResult.invalid.length > 0) {
                        document.getElementById('error-section').style.display = 'block';
                        const errorMsg = document.getElementById('error-message');
                        errorMsg.textContent = `Skipped ${parseResult.invalid.length} rows. ${parseResult.errors.slice(0, 3).join('. ')}`;
                    }
                    
                    // Refresh contacts list
                    this.renderContacts();
                    this.updateDashboardStats();
                    
                    // Auto-close after 3 seconds
                    setTimeout(() => {
                        this.closeCSVModal();
                        showToast(`Imported ${imported.length} contacts!`, 'success');
                    }, 3000);
                }, 500);
            }, 800);
        }, 500);
    }

    // ============================================
    // Batch Operations
    // ============================================

    handleContactSelect(e) {
        const checkbox = e.target;
        const contactId = checkbox.value;
        
        if (checkbox.checked) {
            this.selectedContacts.add(contactId);
        } else {
            this.selectedContacts.delete(contactId);
        }
        
        this.updateBatchActions();
    }

    handleSelectAll(e) {
        const isChecked = e.target.checked;
        const checkboxes = document.querySelectorAll('.contact-select');
        
        this.selectedContacts.clear();
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            if (isChecked) {
                this.selectedContacts.add(checkbox.value);
            }
        });
        
        this.updateBatchActions();
    }

    updateBatchActions() {
        const batchActions = document.getElementById('batch-actions');
        const selectedCount = document.getElementById('selected-count');
        const deleteCounts = document.querySelectorAll('.delete-count');
        const researchCounts = document.querySelectorAll('.research-count');
        
        if (!batchActions) return;
        
        const count = this.selectedContacts.size;
        
        if (count > 0) {
            batchActions.style.display = 'flex';
            selectedCount.textContent = count;
            deleteCounts.forEach(el => el.textContent = count);
            researchCounts.forEach(el => el.textContent = count);
        } else {
            batchActions.style.display = 'none';
        }
        
        // Update select-all checkbox state
        const selectAll = document.getElementById('select-all');
        const totalCheckboxes = document.querySelectorAll('.contact-select').length;
        
        if (selectAll) {
            selectAll.checked = count === totalCheckboxes && count > 0;
            selectAll.indeterminate = count > 0 && count < totalCheckboxes;
        }
    }

    handleBatchDelete() {
        const count = this.selectedContacts.size;
        
        if (count === 0) return;
        
        if (confirm(`Delete ${count} contact${count > 1 ? 's' : ''}? This cannot be undone.`)) {
            const ids = Array.from(this.selectedContacts);
            
            // Show progress for large batches
            if (count > 5) {
                showToast(`Deleting ${count} contacts...`, 'info');
            }
            
            const deleted = this.contactManager.deleteContacts(ids);
            
            this.selectedContacts.clear();
            this.renderContacts();
            this.updateBatchActions();
            this.updateDashboardStats();
            
            showToast(`Deleted ${deleted} contact${deleted > 1 ? 's' : ''} successfully!`, 'success');
        }
    }

    handleBatchResearch() {
        const count = this.selectedContacts.size;
        
        if (count === 0) return;
        
        // Get contacts and filter only those that can be researched
        const ids = Array.from(this.selectedContacts);
        const researchableIds = ids.filter(id => {
            const contact = this.contactManager.getContactById(id);
            return contact && (contact.research_status === 'pending' || contact.research_status === 'no_activity');
        });
        
        if (researchableIds.length === 0) {
            showToast('No contacts available for research (only pending contacts can be researched)', 'info');
            return;
        }
        
        if (researchableIds.length !== ids.length) {
            showToast(`${researchableIds.length} of ${ids.length} selected contacts will be researched`, 'info');
        }
        
        // Start batch research
        if (window.researchEngine) {
            window.researchEngine.startBatchResearch(researchableIds);
            
            // Clear selections
            this.selectedContacts.clear();
            this.updateBatchActions();
        } else {
            showToast('Research engine not initialized', 'error');
        }
    }

    // ============================================
    // Dashboard Statistics Update
    // ============================================

    updateDashboardStats() {
        const stats = this.contactManager.getStatistics();
        
        const totalEl = document.getElementById('totalContacts');
        const completedEl = document.getElementById('completedCount');
        const pendingEl = document.getElementById('pendingCount');
        const successRateEl = document.getElementById('successRate');
        
        if (totalEl) {
            totalEl.textContent = stats.total;
            this.animateStatChange(totalEl);
        }
        
        if (completedEl) {
            completedEl.textContent = stats.completed;
            this.animateStatChange(completedEl);
        }
        
        if (pendingEl) {
            pendingEl.textContent = stats.pending;
            this.animateStatChange(pendingEl);
        }
        
        if (successRateEl) {
            successRateEl.textContent = stats.successRate;
            this.animateStatChange(successRateEl);
        }
    }

    animateStatChange(element) {
        element.style.transform = 'scale(1.15)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    // ============================================
    // Utility Functions
    // ============================================

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
let contactUI;

document.addEventListener('DOMContentLoaded', () => {
    if (window.contactManager) {
        contactUI = new ContactUI(window.contactManager);
        contactUI.renderContacts();
        contactUI.updateDashboardStats();
        console.log('✅ Contact UI initialized');
    }
});

// Export for global access
window.ContactUI = ContactUI;