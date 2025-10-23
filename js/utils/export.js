// ============================================
// Export Utilities
// CSV and data export functionality
// ============================================

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 */
function exportToCSV(data, filename = 'icebreaking_results') {
    if (!data || data.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    // Define CSV headers
    const headers = [
        'Full Name',
        'Company',
        'Job Title',
        'Contact Location',
        'Activity Summary',
        'Activity Date',
        'Activity Type',
        'Icebreaker A',
        'Icebreaker B',
        'Source URL',
        'Personal LinkedIn',
        'Company Website',
        'Notes',
        'Research Date'
    ];

    // Convert data to CSV rows
    const rows = data.map(contact => [
        contact.full_name || '',
        contact.company || '',
        contact.job_title || '',
        contact.contact_location || '',
        contact.activity_summary || '',
        contact.activity_date || '',
        formatActivityType(contact.activity_type),
        contact.icebreaker_a || '',
        contact.icebreaker_b || '',
        contact.source_url || '',
        contact.personal_linkedin_url || '',
        contact.company_website || '',
        contact.notes || '',
        formatDate(contact.updated_date) || ''
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => escapeCsvCell(cell)).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, `${filename}.csv`);
    } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${filename}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showToast(`Exported ${data.length} contacts to ${filename}.csv`, 'success');
}

/**
 * Escape CSV cell content
 * @param {String} cell - Cell content
 * @returns {String} Escaped cell content
 */
function escapeCsvCell(cell) {
    if (cell === null || cell === undefined) {
        return '';
    }

    const cellString = String(cell);
    
    // If cell contains comma, quotes, or newlines, wrap in quotes and escape quotes
    if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
        return `"${cellString.replace(/"/g, '""')}"`;
    }
    
    return cellString;
}

/**
 * Format activity type for export
 * @param {String} type - Activity type
 * @returns {String} Formatted type
 */
function formatActivityType(type) {
    const types = {
        'recent_activity': 'Recent Activity',
        'volunteer_connection': 'Volunteer Connection',
        'alumni_connection': 'Alumni Connection',
        'company_research': 'Company Research'
    };
    
    return types[type] || type || 'N/A';
}

/**
 * Format date for export
 * @param {String} dateString - ISO date string
 * @returns {String} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Export contacts to CSV with specific status
 * @param {ContactManager} contactManager - Contact manager instance
 * @param {String} status - Status to filter (default: 'completed')
 */
function exportContactsByStatus(contactManager, status = 'completed') {
    const contacts = contactManager.getContactsByStatus(status);
    
    if (contacts.length === 0) {
        showToast(`No ${status} contacts to export`, 'info');
        return;
    }

    const filename = `icebreaking_results_${status}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(contacts, filename);
}

/**
 * Export all contacts
 * @param {ContactManager} contactManager - Contact manager instance
 */
function exportAllContacts(contactManager) {
    const contacts = contactManager.getAllContacts();
    
    if (contacts.length === 0) {
        showToast('No contacts to export', 'info');
        return;
    }

    const filename = `icebreaking_all_contacts_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(contacts, filename);
}

// Export functions for global access
window.ExportUtils = {
    exportToCSV,
    exportContactsByStatus,
    exportAllContacts,
    escapeCsvCell,
    formatActivityType,
    formatDate
};
