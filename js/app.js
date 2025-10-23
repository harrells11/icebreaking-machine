// ============================================
// Icebreaking Machine - Application Logic
// CRE Networking Intelligence Platform
// ============================================

// Initialize Contact Manager
let contactManager;

// Sample Data (will be replaced by contact data)
let sampleRecentResearch = [];
let sampleResults = [];

// ============================================
// Navigation Management
// ============================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    // Handle navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items and pages
            console.log('[Navigation] Removing active class from all pages...');
            navItems.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => {
                if (page.classList.contains('active')) {
                    console.log('[Navigation] Hiding page:', page.id);
                }
                page.classList.remove('active');
                // Force hide with inline style
                page.style.display = 'none';
            });
            
            // Add active class to clicked nav item
            item.classList.add('active');
            
            // Show corresponding page
            const pageId = item.dataset.page;
            console.log('[Navigation] Clicked page:', pageId);
            const targetPage = document.getElementById(`${pageId}-page`);
            console.log('[Navigation] Target page found:', !!targetPage);
            
            if (targetPage) {
                targetPage.classList.add('active');
                // Force show with inline style
                targetPage.style.display = 'block';
                console.log('[Navigation] Showing page:', pageId + '-page');
                console.log('[Navigation] Page display style:', targetPage.style.display);
                
                // Refresh Dashboard when navigating to it (Chunk 5)
                if (pageId === 'dashboard' && window.dashboardUI) {
                    console.log('Rendering Dashboard...');
                    window.dashboardUI.renderDashboard();
                }
                
                // Refresh Results Library when navigating to it
                if (pageId === 'results' && window.resultsUI) {
                    console.log('Rendering Results Library...');
                    window.resultsUI.renderResultsLibrary();
                }
                
                // Render Settings when navigating to it (Chunk 6)
                if (pageId === 'settings' && window.settingsUI) {
                    console.log('Rendering Settings...');
                    window.settingsUI.renderSettings();
                }
                
                // Feedback page is static HTML, no rendering needed
                if (pageId === 'feedback') {
                    console.log('Showing Feedback page...');
                }
            } else {
                console.error('[Navigation] ERROR: Could not find page:', pageId + '-page');
            }
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
    
    // Handle "View All" link
    const viewAllLinks = document.querySelectorAll('.view-all-link');
    viewAllLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            const targetNav = document.querySelector(`[data-page="${pageId}"]`);
            if (targetNav) {
                targetNav.click();
            }
        });
    });
}

// ============================================
// Sidebar Toggle (Mobile)
// ============================================
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ============================================
// Profile Dropdown Menu
// ============================================
function initProfileDropdown() {
    const userProfile = document.getElementById('userProfile');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (!userProfile || !profileDropdown) return;
    
    // Toggle dropdown on profile click
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfile.classList.toggle('active');
        profileDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userProfile.contains(e.target) && !profileDropdown.contains(e.target)) {
            userProfile.classList.remove('active');
            profileDropdown.classList.remove('active');
        }
    });
    
    // Handle dropdown menu items
    document.getElementById('profileMenuItem')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Profile management coming soon!', 'info');
        profileDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });
    
    document.getElementById('helpMenuItem')?.addEventListener('click', (e) => {
        e.preventDefault();
        // Navigate to feedback page
        const feedbackNav = document.querySelector('[data-page="feedback"]');
        if (feedbackNav) feedbackNav.click();
        profileDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });
    
    document.getElementById('logoutMenuItem')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            showToast('Logout functionality coming soon!', 'info');
        }
        profileDropdown.classList.remove('active');
        userProfile.classList.remove('active');
    });
    
    // Handle settings link in dropdown
    const settingsLink = profileDropdown.querySelector('[data-page="settings"]');
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const settingsNav = document.querySelector('.nav-item[data-page="settings"]');
            if (settingsNav) settingsNav.click();
            profileDropdown.classList.remove('active');
            userProfile.classList.remove('active');
        });
    }
}

// ============================================
// Dashboard - Recent Research
// ============================================
function populateRecentResearch() {
    const container = document.getElementById('recentResearchList');
    
    if (!container) return;
    
    // Get completed contacts from contact manager
    if (!contactManager) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Loading...</p>';
        return;
    }
    
    const completedContacts = contactManager.getContactsByStatus('completed')
        .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
        .slice(0, 5);
    
    if (completedContacts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No completed research yet</p>';
        return;
    }
    
    container.innerHTML = completedContacts.map(contact => {
        const timeAgo = getTimeAgo(contact.updated_date);
        return `
            <div class="research-item">
                <div class="research-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="research-info">
                    <div class="research-name">${escapeHtml(contact.full_name)}</div>
                    <div class="research-company">${escapeHtml(contact.company)}</div>
                </div>
                <div class="research-date">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return formatDate(dateString);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Results Library - Table Population
// ============================================
function populateResultsTable(contacts = null) {
    const tbody = document.getElementById('resultsTableBody');
    
    if (!tbody) return;
    
    if (!contactManager) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';
        return;
    }
    
    const contactsToShow = contacts || contactManager.getAllContacts();
    
    if (contactsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No contacts found</td></tr>';
        return;
    }
    
    tbody.innerHTML = contactsToShow.map(contact => {
        const initials = contact.full_name.split(' ').map(n => n[0]).join('');
        const statusClass = contact.research_status.toLowerCase().replace(' ', '-');
        
        // Get icebreaker preview
        let icebreaker = contact.icebreaker_a || contact.icebreaker_b || '';
        if (!icebreaker && contact.activity_summary) {
            icebreaker = contact.activity_summary;
        }
        if (!icebreaker) {
            icebreaker = contact.research_status === 'completed' ? 'Icebreaker ready' : 'No icebreaker yet';
        }
        
        return `
            <tr>
                <td>
                    <div class="contact-cell">
                        <div class="contact-avatar">${initials}</div>
                        <div class="contact-name">${escapeHtml(contact.full_name)}</div>
                    </div>
                </td>
                <td>${escapeHtml(contact.company)}</td>
                <td>
                    <span class="status-badge status-${statusClass}">${getStatusLabel(contact.research_status)}</span>
                </td>
                <td>
                    <div class="icebreaker-preview" title="${escapeHtml(icebreaker)}">
                        ${escapeHtml(icebreaker)}
                    </div>
                </td>
                <td>${formatDate(contact.updated_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" title="View Details" onclick="viewContactDetails('${contact.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" title="Copy Icebreaker" onclick="copyContactIcebreaker('${contact.id}')">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" title="Edit" onclick="contactUI?.editContact('${contact.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending',
        'researching': 'Researching',
        'research_complete': 'Review Needed',
        'approved': 'Approved',
        'icebreaker_generating': 'Generating',
        'completed': 'Completed',
        'no_activity': 'No Activity Found'
    };
    return labels[status] || status;
}

// ============================================
// Results Library - Search & Filter
// ============================================
function initResultsFilter() {
    const searchInput = document.getElementById('resultsSearch');
    const statusFilter = document.getElementById('statusFilter');
    
    if (!searchInput || !statusFilter) return;
    
    const filterResults = () => {
        if (!contactManager) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        
        let filtered = contactManager.getAllContacts().filter(contact => {
            const matchesSearch = 
                contact.full_name.toLowerCase().includes(searchTerm) ||
                contact.company.toLowerCase().includes(searchTerm) ||
                (contact.icebreaker_a && contact.icebreaker_a.toLowerCase().includes(searchTerm)) ||
                (contact.activity_summary && contact.activity_summary.toLowerCase().includes(searchTerm));
            
            const matchesStatus = statusValue === 'all' || contact.research_status === statusValue;
            
            return matchesSearch && matchesStatus;
        });
        
        populateResultsTable(filtered);
    };
    
    searchInput.addEventListener('input', filterResults);
    statusFilter.addEventListener('change', filterResults);
}

// ============================================
// Research Form Handling
// ============================================
function initResearchForm() {
    const form = document.getElementById('researchForm');
    const startResearchBtn = document.getElementById('startResearchBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    
    if (!startResearchBtn) return;
    
    startResearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const contactName = document.getElementById('contactName').value;
        const contactCompany = document.getElementById('contactCompany').value;
        
        if (!contactName || !contactCompany) {
            showToast('Please fill in required fields (Name and Company)', 'error');
            return;
        }
        
        // Simulate research start
        showToast(`Research started for ${contactName} at ${contactCompany}`, 'success');
        
        // Update statistics
        updateStatistics('pending', 1);
        
        // Clear form after delay
        setTimeout(() => {
            if (clearFormBtn) clearFormBtn.click();
        }, 1500);
    });
    
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', () => {
            if (form) {
                form.reset();
                // Reset radio buttons to default
                const defaultRadio = document.querySelector('input[name="researchDepth"][value="quick"]');
                if (defaultRadio) defaultRadio.checked = true;
            }
            showToast('Form cleared', 'info');
        });
    }
}

// ============================================
// Feedback Form Handling
// ============================================
function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const subject = document.getElementById('feedbackSubject').value;
        const message = document.getElementById('feedbackMessage').value;
        
        if (!subject || !message) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Simulate feedback submission
        showToast('Thank you for your feedback! We\'ll review it shortly.', 'success');
        
        // Clear form
        form.reset();
    });
}

// ============================================
// Action Functions
// ============================================
function viewContactDetails(contactId) {
    if (!contactManager) return;
    
    const contact = contactManager.getContactById(contactId);
    if (contact) {
        const icebreaker = contact.icebreaker_a || contact.icebreaker_b || contact.activity_summary || 'No icebreaker generated yet';
        
        alert(`Contact Details:\n\nName: ${contact.full_name}\nTitle: ${contact.job_title || 'N/A'}\nCompany: ${contact.company}\nLocation: ${contact.contact_location || 'N/A'}\nStatus: ${getStatusLabel(contact.research_status)}\n\nIcebreaker:\n${icebreaker}`);
    }
}

function copyContactIcebreaker(contactId) {
    if (!contactManager) return;
    
    const contact = contactManager.getContactById(contactId);
    if (!contact) return;
    
    const text = contact.icebreaker_a || contact.icebreaker_b || contact.activity_summary || '';
    
    if (!text) {
        showToast('No icebreaker available to copy', 'info');
        return;
    }
    
    // Create temporary textarea to copy text
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('Icebreaker copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textarea);
}

// ============================================
// Statistics Update (Removed - now handled by ContactUI)
// ============================================
function updateStatistics() {
    if (!contactManager) return;
    
    const stats = contactManager.getStatistics();
    
    const totalContactsEl = document.getElementById('totalContacts');
    const completedCountEl = document.getElementById('completedCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const successRateEl = document.getElementById('successRate');
    
    if (totalContactsEl) totalContactsEl.textContent = stats.total;
    if (completedCountEl) completedCountEl.textContent = stats.completed;
    if (pendingCountEl) pendingCountEl.textContent = stats.pending;
    if (successRateEl) successRateEl.textContent = stats.successRate;
    
    // Animate changes
    [totalContactsEl, completedCountEl, pendingCountEl, successRateEl].forEach(el => {
        if (el) {
            el.style.transform = 'scale(1.1)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

// ============================================
// Toast Notification
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('i');
    
    if (!toast) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon based on type
    switch(type) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle';
            toastIcon.style.color = 'var(--success-green)';
            break;
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle';
            toastIcon.style.color = 'var(--danger-red)';
            break;
        case 'info':
            toastIcon.className = 'fas fa-info-circle';
            toastIcon.style.color = 'var(--primary-blue)';
            break;
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Utility Functions
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// ============================================
// Smooth Transitions
// ============================================
function initSmoothTransitions() {
    // Add smooth transition to stat values
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        stat.style.transition = 'transform 0.2s ease';
    });
}

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Icebreaking Machine - Initializing...');
    
    // Make SettingsModel globally accessible (Chunk 6)
    window.SettingsModel = SettingsModel;
    
    // Initialize Contact Manager
    contactManager = new ContactManager();
    window.contactManager = contactManager; // Make globally accessible
    
    // Initialize Research Engine
    const researchEngine = new ResearchEngine(contactManager);
    window.researchEngine = researchEngine;
    
    // Initialize Research UI
    const researchUI = new ResearchUI(contactManager, researchEngine);
    window.researchUI = researchUI;
    
    // Initialize Icebreaker Engine
    const icebreakerEngine = new IcebreakerEngine(contactManager);
    window.icebreakerEngine = icebreakerEngine;
    
    // Initialize Credit Tracker (Chunk 5)
    const creditTracker = new CreditTracker();
    window.creditTracker = creditTracker;
    creditTracker.init(); // Initialize and check for reset
    
    // Initialize Feedback UI (Chunk 5)
    const feedbackUI = new FeedbackUI(contactManager, null); // Learning engine will be set next
    window.feedbackUI = feedbackUI;
    
    // Initialize Learning Engine (Chunk 5)
    const learningEngine = new LearningEngine(feedbackUI);
    window.learningEngine = learningEngine;
    feedbackUI.learningEngine = learningEngine; // Set learning engine reference
    
    // Initialize Dashboard UI (Chunk 5)
    const dashboardUI = new DashboardUI(contactManager, creditTracker);
    window.dashboardUI = dashboardUI;
    
    // Initialize Results Library UI
    const resultsUI = new ResultsLibraryUI(contactManager);
    window.resultsUI = resultsUI;
    
    // Initialize all modules
    initNavigation();
    initSidebarToggle();
    initProfileDropdown();
    populateRecentResearch();
    populateResultsTable();
    initResultsFilter();
    initFeedbackForm();
    initSmoothTransitions();
    updateStatistics();
    
    // Render Dashboard with credit tracker (Chunk 5)
    dashboardUI.renderDashboard();
    
    // Render approval section if there are contacts awaiting approval
    researchUI.renderApprovalSection();
    
    // Render results library
    resultsUI.renderResultsLibrary();
    
    // Initialize Settings UI (Chunk 6)
    const settingsUI = new SettingsUI(creditTracker);
    window.settingsUI = settingsUI;
    
    // Always render settings content on page load (even if not visible)
    // This ensures content is ready when user navigates to settings
    console.log('[App] Rendering settings content on page load...');
    settingsUI.renderSettings();
    
    console.log('✅ Icebreaking Machine - Ready!');
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome to Icebreaking Machine! 🎯', 'success');
    }, 500);
});

// ============================================
// Export for Global Access
// ============================================
window.IcebreakingMachine = {
    viewContactDetails,
    copyContactIcebreaker,
    showToast,
    updateStatistics,
    formatDate,
    escapeHtml,
    getStatusLabel
};
