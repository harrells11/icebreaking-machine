// ============================================
// ContactManager - Complete CRUD System
// Handles all contact operations and persistence
// ============================================

class ContactManager {
    constructor() {
        this.contacts = [];
        this.storageKey = 'icebreaking_machine_contacts';
        this.loadFromStorage();
    }

    // ============================================
    // Storage Operations
    // ============================================
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.contacts = JSON.parse(stored);
                console.log(`✅ Loaded ${this.contacts.length} contacts from storage`);
            } else {
                // Initialize with sample data on first load
                this.initializeSampleData();
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
            this.contacts = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.contacts));
            console.log(`💾 Saved ${this.contacts.length} contacts to storage`);
        } catch (error) {
            console.error('Error saving contacts:', error);
        }
    }

    // ============================================
    // CRUD Operations
    // ============================================

    getAllContacts() {
        return [...this.contacts];
    }

    getContactById(id) {
        return this.contacts.find(contact => contact.id === id);
    }

    createContact(contactData) {
        const contact = {
            id: this.generateId(),
            full_name: contactData.full_name,
            job_title: contactData.job_title || '',
            company: contactData.company,
            contact_location: contactData.contact_location || '',
            company_location: contactData.company_location || '',
            personal_linkedin_url: contactData.personal_linkedin_url || '',
            company_linkedin_url: contactData.company_linkedin_url || '',
            company_website: contactData.company_website || '',
            notes: contactData.notes || '',
            
            // Research status tracking
            research_status: 'pending',
            
            // Research results (populated later)
            activity_summary: null,
            activity_date: null,
            source_url: null,
            activity_type: null,
            research_approved: false,
            research_feedback: null,
            
            // Generated icebreakers (populated later)
            icebreaker_a: null,
            icebreaker_b: null,
            alumni_school: null,
            
            // System fields
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };

        this.contacts.push(contact);
        this.saveToStorage();
        console.log(`✅ Created contact: ${contact.full_name}`);
        return contact;
    }

    updateContact(id, contactData) {
        const index = this.contacts.findIndex(contact => contact.id === id);
        
        if (index === -1) {
            console.error(`Contact not found: ${id}`);
            return null;
        }

        // Update only provided fields, keep existing data for others
        const existingContact = this.contacts[index];
        const updatedContact = {
            ...existingContact,
            ...contactData,
            id: existingContact.id, // Never change ID
            created_date: existingContact.created_date, // Keep original creation date
            updated_date: new Date().toISOString()
        };

        this.contacts[index] = updatedContact;
        this.saveToStorage();
        console.log(`✅ Updated contact: ${updatedContact.full_name}`);
        return updatedContact;
    }

    deleteContact(id) {
        const index = this.contacts.findIndex(contact => contact.id === id);
        
        if (index === -1) {
            console.error(`Contact not found: ${id}`);
            return false;
        }

        const contact = this.contacts[index];
        this.contacts.splice(index, 1);
        this.saveToStorage();
        console.log(`✅ Deleted contact: ${contact.full_name}`);
        return true;
    }

    deleteContacts(ids) {
        const deleted = [];
        
        ids.forEach(id => {
            const index = this.contacts.findIndex(contact => contact.id === id);
            if (index !== -1) {
                deleted.push(this.contacts[index].full_name);
                this.contacts.splice(index, 1);
            }
        });

        this.saveToStorage();
        console.log(`✅ Deleted ${deleted.length} contacts:`, deleted);
        return deleted.length;
    }

    // ============================================
    // Query Operations
    // ============================================

    getContactsByStatus(status) {
        return this.contacts.filter(contact => contact.research_status === status);
    }

    searchContacts(searchTerm) {
        if (!searchTerm) return this.getAllContacts();
        
        const term = searchTerm.toLowerCase();
        return this.contacts.filter(contact => 
            contact.full_name.toLowerCase().includes(term) ||
            contact.company.toLowerCase().includes(term) ||
            (contact.job_title && contact.job_title.toLowerCase().includes(term)) ||
            (contact.notes && contact.notes.toLowerCase().includes(term))
        );
    }

    getStatistics() {
        const total = this.contacts.length;
        const completed = this.getContactsByStatus('completed').length;
        const pending = this.getContactsByStatus('pending').length;
        const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

        return {
            total,
            completed,
            pending,
            successRate: `${successRate}%`
        };
    }

    // ============================================
    // Utility Functions
    // ============================================

    generateId() {
        return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============================================
    // CSV Import Functions
    // ============================================

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            return { valid: [], invalid: [], errors: ['CSV file is empty or has no data rows'] };
        }

        // Parse headers (case-insensitive)
        const headers = this.parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
        
        const valid = [];
        const invalid = [];
        const errors = [];

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            
            // Skip empty rows
            if (values.every(v => !v.trim())) continue;

            try {
                const contact = this.mapCSVRowToContact(headers, values);
                
                // Validate required fields
                if (!contact.full_name || !contact.company) {
                    invalid.push({
                        row: i + 1,
                        data: values,
                        reason: 'Missing required fields (Full Name or Company)'
                    });
                    errors.push(`Row ${i + 1}: Missing required fields`);
                } else {
                    valid.push(contact);
                }
            } catch (error) {
                invalid.push({
                    row: i + 1,
                    data: values,
                    reason: error.message
                });
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

        return { valid, invalid, errors };
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quotes
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Push last value
        values.push(current.trim());

        return values;
    }

    mapCSVRowToContact(headers, values) {
        const data = {};

        // Create a map of header to value
        headers.forEach((header, index) => {
            if (values[index]) {
                data[header] = values[index].trim();
            }
        });

        // Map column variations to standard fields
        const contact = {
            full_name: this.getCSVValue(data, ['full name', 'name', 'full_name', 'fullname']),
            company: this.getCSVValue(data, ['company', 'company name', 'organization']),
            job_title: this.getCSVValue(data, ['title', 'job title', 'job_title', 'jobtitle', 'position']),
            contact_location: this.getCSVValue(data, ['contact location', 'location', 'city', 'contact_location']),
            company_location: this.getCSVValue(data, ['company location', 'company_location', 'office location']),
            personal_linkedin_url: this.getCSVValue(data, ['personal linkedin', 'linkedin', 'personal_linkedin_url', 'linkedin url']),
            company_linkedin_url: this.getCSVValue(data, ['company linkedin', 'company_linkedin_url', 'company linkedin url']),
            company_website: this.getCSVValue(data, ['website', 'company website', 'company_website', 'url']),
            notes: this.getCSVValue(data, ['notes', 'note', 'comments', 'description'])
        };

        // Handle First Name + Last Name combination
        if (!contact.full_name) {
            const firstName = this.getCSVValue(data, ['first name', 'first_name', 'firstname']);
            const lastName = this.getCSVValue(data, ['last name', 'last_name', 'lastname']);
            
            if (firstName && lastName) {
                contact.full_name = `${firstName} ${lastName}`;
            } else if (firstName) {
                contact.full_name = firstName;
            }
        }

        return contact;
    }

    getCSVValue(data, possibleKeys) {
        for (const key of possibleKeys) {
            if (data[key]) {
                return data[key];
            }
        }
        return '';
    }

    importContactsFromCSV(validContacts) {
        const imported = [];
        
        validContacts.forEach(contactData => {
            const contact = this.createContact(contactData);
            imported.push(contact);
        });

        console.log(`✅ Imported ${imported.length} contacts from CSV`);
        return imported;
    }

    // ============================================
    // Sample Data Initialization
    // ============================================

    initializeSampleData() {
        console.log('🔧 Initializing sample data...');
        
        const samples = [
            {
                full_name: "Michael Chen",
                job_title: "Senior Vice President",
                company: "CBRE",
                contact_location: "New York, NY",
                company_location: "New York, NY",
                personal_linkedin_url: "https://linkedin.com/in/michaelchen",
                company_website: "https://www.cbre.com",
                notes: "Met at ICSC conference in Las Vegas",
                research_status: "completed",
                activity_summary: "Recently closed $45M office tower deal in downtown Manhattan",
                activity_date: "2024-01-15",
                source_url: "https://www.cbre.com/news",
                activity_type: "recent_activity",
                research_approved: true,
                icebreaker_a: "I noticed you recently closed the $45M office tower deal in downtown Manhattan. Impressive work navigating that complex transaction!",
                icebreaker_b: "Congratulations on the downtown Manhattan office deal! Your expertise in navigating complex transactions is really impressive."
            },
            {
                full_name: "Sarah Williams",
                job_title: "Managing Director",
                company: "JLL",
                contact_location: "Chicago, IL",
                company_location: "Chicago, IL",
                personal_linkedin_url: "https://linkedin.com/in/sarahwilliams",
                company_linkedin_url: "https://linkedin.com/company/jll",
                company_website: "https://www.jll.com",
                notes: "",
                research_status: "completed",
                activity_summary: "Featured in Real Estate Weekly for innovative approach to sustainable building conversions",
                activity_date: "2024-01-18",
                source_url: "https://www.reweekly.com",
                activity_type: "recent_activity",
                research_approved: true,
                icebreaker_a: "Congratulations on being featured in Real Estate Weekly for your innovative approach to sustainable building conversions!",
                icebreaker_b: "I saw your feature in Real Estate Weekly about sustainable conversions. Your innovative approach is really inspiring the industry."
            },
            {
                full_name: "Robert Thompson",
                job_title: "Executive Vice President",
                company: "Cushman & Wakefield",
                contact_location: "Atlanta, GA",
                company_location: "Atlanta, GA",
                personal_linkedin_url: "https://linkedin.com/in/robertthompson",
                company_website: "https://www.cushmanwakefield.com",
                notes: "Connected through mutual friend Tom Richards",
                research_status: "research_complete",
                activity_summary: "Recent LinkedIn post about the future of hybrid workspaces gaining significant engagement",
                activity_date: "2024-01-17",
                source_url: "https://linkedin.com/in/robertthompson",
                activity_type: "recent_activity",
                research_approved: false
            },
            {
                full_name: "Emily Rodriguez",
                job_title: "Senior Broker",
                company: "Newmark",
                contact_location: "Miami, FL",
                company_location: "Miami, FL",
                personal_linkedin_url: "https://linkedin.com/in/emilyrodriguez",
                notes: "Both attended Urban Land Institute conference",
                research_status: "pending"
            },
            {
                full_name: "David Park",
                job_title: "Director of Capital Markets",
                company: "Colliers International",
                contact_location: "Dallas, TX",
                company_location: "Dallas, TX",
                personal_linkedin_url: "https://linkedin.com/in/davidpark",
                company_linkedin_url: "https://linkedin.com/company/colliers",
                company_website: "https://www.colliers.com",
                notes: "",
                research_status: "pending"
            },
            {
                full_name: "Jennifer Martinez",
                job_title: "Vice President",
                company: "Avison Young",
                contact_location: "Los Angeles, CA",
                company_location: "Los Angeles, CA",
                personal_linkedin_url: "https://linkedin.com/in/jennifermartinez",
                notes: "",
                research_status: "pending"
            },
            {
                full_name: "Kevin Brown",
                job_title: "Managing Partner",
                company: "NAI Global",
                contact_location: "Denver, CO",
                company_location: "Denver, CO",
                personal_linkedin_url: "https://linkedin.com/in/kevinbrown",
                company_website: "https://www.naiglobal.com",
                notes: "Connected with Tom Richards at Brookfield",
                research_status: "pending"
            },
            {
                full_name: "Amanda Taylor",
                job_title: "Managing Director",
                company: "Lee & Associates",
                contact_location: "Phoenix, AZ",
                company_location: "Phoenix, AZ",
                personal_linkedin_url: "https://linkedin.com/in/amandataylor",
                notes: "Recently promoted",
                research_status: "completed",
                activity_summary: "Promoted to Managing Director with impressive track record in retail real estate",
                activity_date: "2024-01-10",
                source_url: "https://linkedin.com/in/amandataylor",
                activity_type: "recent_activity",
                research_approved: true,
                icebreaker_a: "Congratulations on your promotion to Managing Director! Your track record in retail real estate speaks for itself.",
                icebreaker_b: "I saw your recent promotion to Managing Director - well deserved! Your retail real estate expertise is truly impressive."
            }
        ];

        samples.forEach(data => {
            const contact = {
                id: this.generateId(),
                ...data,
                created_date: new Date().toISOString(),
                updated_date: new Date().toISOString()
            };
            
            // Set defaults for fields not provided
            if (!contact.job_title) contact.job_title = '';
            if (!contact.contact_location) contact.contact_location = '';
            if (!contact.company_location) contact.company_location = '';
            if (!contact.personal_linkedin_url) contact.personal_linkedin_url = '';
            if (!contact.company_linkedin_url) contact.company_linkedin_url = '';
            if (!contact.company_website) contact.company_website = '';
            if (!contact.notes) contact.notes = '';
            if (!contact.activity_summary) contact.activity_summary = null;
            if (!contact.activity_date) contact.activity_date = null;
            if (!contact.source_url) contact.source_url = null;
            if (!contact.activity_type) contact.activity_type = null;
            if (contact.research_approved === undefined) contact.research_approved = false;
            if (!contact.research_feedback) contact.research_feedback = null;
            if (!contact.icebreaker_a) contact.icebreaker_a = null;
            if (!contact.icebreaker_b) contact.icebreaker_b = null;
            if (!contact.alumni_school) contact.alumni_school = null;

            this.contacts.push(contact);
        });

        this.saveToStorage();
        console.log(`✅ Initialized ${this.contacts.length} sample contacts`);
    }

    clearAllContacts() {
        this.contacts = [];
        this.saveToStorage();
        console.log('🗑️ Cleared all contacts');
    }
}

// Export for global access
window.ContactManager = ContactManager;