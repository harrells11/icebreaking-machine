// ============================================
// Research Engine - Five-Step Research Methodology
// Simulates comprehensive contact research workflow
// ============================================

class ResearchEngine {
    constructor(contactManager) {
        this.contactManager = contactManager;
        this.userAlumniSchool = "University of Tennessee"; // Default, can be loaded from settings
        this.researchQueue = [];
        this.isProcessing = false;
    }

    // ============================================
    // Main Research Orchestration
    // ============================================

    async startResearch(contactId) {
        const contact = this.contactManager.getContactById(contactId);
        
        if (!contact) {
            console.error('Contact not found:', contactId);
            return false;
        }

        // Update status to researching
        this.contactManager.updateContact(contactId, {
            research_status: 'researching'
        });

        showToast(`Starting research for ${contact.full_name}...`, 'info');

        // Refresh UI to show researching status
        if (window.contactUI) {
            window.contactUI.renderContacts();
            window.contactUI.updateDashboardStats();
        }

        // Run the five-step research process
        const result = await this.runFiveStepResearch(contact);

        // Update contact with results
        this.contactManager.updateContact(contactId, {
            research_status: result.status,
            activity_summary: result.activity_summary,
            activity_date: result.activity_date,
            source_url: result.source_url,
            activity_type: result.activity_type,
            research_approved: false,
            research_feedback: null
        });

        // Refresh UI
        if (window.contactUI) {
            window.contactUI.renderContacts();
            window.contactUI.updateDashboardStats();
        }

        if (window.researchUI) {
            window.researchUI.renderApprovalSection();
        }

        showToast(`Research complete for ${contact.full_name}!`, 'success');
        return result;
    }

    async runFiveStepResearch(contact, context = null) {
        // Simulate research delay (2-4 seconds)
        const delay = 2000 + Math.random() * 2000;
        await this.sleep(delay);

        // Try each step in order until we find something
        let result;

        // Step 1: Personal LinkedIn Research
        result = await this.stepPersonalLinkedIn(contact, context);
        if (result.found) return result;

        // Step 2: Company LinkedIn Research
        result = await this.stepCompanyLinkedIn(contact, context);
        if (result.found) return result;

        // Step 3: Company Website & Industry News
        result = await this.stepCompanyNews(contact, context);
        if (result.found) return result;

        // Step 4: Alumni Connection Check
        result = await this.stepAlumniConnection(contact, context);
        if (result.found) return result;

        // Step 5: Company Research Fallback
        return await this.stepCompanyResearch(contact, context);
    }

    // ============================================
    // Step 1: Personal LinkedIn Research
    // ============================================

    async stepPersonalLinkedIn(contact, context) {
        console.log('Step 1: Personal LinkedIn Research for', contact.full_name);

        // Simulate checking if contact has recent LinkedIn activity
        const hasRecentActivity = Math.random() > 0.5; // 50% chance

        if (!hasRecentActivity) {
            return { found: false };
        }

        // Generate mock LinkedIn activity
        const activities = [
            {
                summary: `Recently shared insights on the future of hybrid workspaces and their impact on commercial real estate investments`,
                daysAgo: Math.floor(Math.random() * 60) + 10
            },
            {
                summary: `Posted about closing a major office tower transaction in downtown ${contact.contact_location || 'the metro area'}`,
                daysAgo: Math.floor(Math.random() * 45) + 5
            },
            {
                summary: `Congratulated their team on achieving record Q4 sales in the industrial sector`,
                daysAgo: Math.floor(Math.random() * 30) + 15
            },
            {
                summary: `Announced promotion to ${contact.job_title} with expanded responsibilities across the region`,
                daysAgo: Math.floor(Math.random() * 60) + 20
            },
            {
                summary: `Shared analysis on emerging trends in adaptive reuse and historic building conversions`,
                daysAgo: Math.floor(Math.random() * 50) + 10
            }
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - activity.daysAgo);

        return {
            found: true,
            status: 'research_complete',
            activity_summary: activity.summary,
            activity_date: activityDate.toISOString().split('T')[0],
            source_url: contact.personal_linkedin_url || `https://linkedin.com/in/${contact.full_name.toLowerCase().replace(' ', '')}`,
            activity_type: 'recent_activity'
        };
    }

    // ============================================
    // Step 2: Company LinkedIn Research
    // ============================================

    async stepCompanyLinkedIn(contact, context) {
        console.log('Step 2: Company LinkedIn Research for', contact.company);

        // 40% chance of finding company activity
        const hasCompanyActivity = Math.random() > 0.6;

        if (!hasCompanyActivity) {
            return { found: false };
        }

        const companyActivities = [
            {
                summary: `${contact.company} announced a strategic partnership to expand their presence in the Sun Belt markets`,
                daysAgo: Math.floor(Math.random() * 60) + 10
            },
            {
                summary: `${contact.company} welcomed a new Executive Vice President to lead their capital markets division`,
                daysAgo: Math.floor(Math.random() * 45) + 5
            },
            {
                summary: `${contact.company} closed $2.1B in transaction volume this quarter, marking their strongest performance to date`,
                daysAgo: Math.floor(Math.random() * 50) + 15
            },
            {
                summary: `${contact.company} launched a new sustainability initiative focused on ESG metrics in commercial properties`,
                daysAgo: Math.floor(Math.random() * 40) + 20
            }
        ];

        const activity = companyActivities[Math.floor(Math.random() * companyActivities.length)];
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - activity.daysAgo);

        return {
            found: true,
            status: 'research_complete',
            activity_summary: activity.summary,
            activity_date: activityDate.toISOString().split('T')[0],
            source_url: contact.company_linkedin_url || `https://linkedin.com/company/${contact.company.toLowerCase().replace(/\s+/g, '-')}`,
            activity_type: 'recent_activity'
        };
    }

    // ============================================
    // Step 3: Company Website & Industry News
    // ============================================

    async stepCompanyNews(contact, context) {
        console.log('Step 3: Company Website & Industry News for', contact.company);

        // 35% chance of finding news
        const hasNews = Math.random() > 0.65;

        if (!hasNews) {
            return { found: false };
        }

        const newsItems = [
            {
                summary: `${contact.company} featured in Commercial Observer for their innovative approach to adaptive reuse projects. The firm has successfully converted three historic buildings into modern office spaces this year.`,
                daysAgo: Math.floor(Math.random() * 90) + 10
            },
            {
                summary: `Real Estate Weekly highlights ${contact.company}'s expansion strategy. The company opened two new regional offices and hired 15 additional brokers to serve growing demand in secondary markets.`,
                daysAgo: Math.floor(Math.random() * 80) + 15
            },
            {
                summary: `${contact.company} press release announces record-breaking year with over $5B in sales volume. The firm credits their technology-forward approach and client-centric service model.`,
                daysAgo: Math.floor(Math.random() * 70) + 20
            },
            {
                summary: `Industry publication recognizes ${contact.company} as a top performer in the multifamily investment sales sector. The firm closed 47 transactions totaling $890M in the past 12 months.`,
                daysAgo: Math.floor(Math.random() * 100) + 5
            }
        ];

        const news = newsItems[Math.floor(Math.random() * newsItems.length)];
        const newsDate = new Date();
        newsDate.setDate(newsDate.getDate() - news.daysAgo);

        return {
            found: true,
            status: 'research_complete',
            activity_summary: news.summary,
            activity_date: newsDate.toISOString().split('T')[0],
            source_url: contact.company_website || `https://${contact.company.toLowerCase().replace(/\s+/g, '')}.com/news`,
            activity_type: 'company_research'
        };
    }

    // ============================================
    // Step 4: Alumni Connection Check
    // ============================================

    async stepAlumniConnection(contact, context) {
        console.log('Step 4: Alumni Connection Check');

        // 15% chance of alumni connection
        const isAlumni = Math.random() > 0.85;

        if (!isAlumni) {
            return { found: false };
        }

        const schools = [
            "University of Tennessee",
            "Vanderbilt University",
            "University of Georgia",
            "Auburn University",
            "University of Alabama"
        ];

        const school = schools[Math.floor(Math.random() * schools.length)];

        return {
            found: true,
            status: 'research_complete',
            activity_summary: `Both attended ${school}. Shared alumni connection provides strong foundation for relationship building.`,
            activity_date: new Date().toISOString().split('T')[0],
            source_url: `https://linkedin.com/school/${school.toLowerCase().replace(/\s+/g, '-')}`,
            activity_type: 'alumni_connection',
            alumni_school: school
        };
    }

    // ============================================
    // Step 5: Company Research Fallback
    // ============================================

    async stepCompanyResearch(contact, context) {
        console.log('Step 5: Company Research Fallback');

        const companyProfiles = [
            {
                summary: `${contact.company} is a leading commercial real estate services firm with a strong presence in the Southeast. The company specializes in office, industrial, and retail properties, offering comprehensive brokerage, property management, and advisory services. Known for their deep market expertise and commitment to client success, they've built a reputation as trusted advisors in complex transactions.`,
            },
            {
                summary: `${contact.company} has established itself as a premier player in the commercial real estate market. With decades of experience, the firm provides full-service solutions including investment sales, leasing, valuation, and consulting services. Their team combines local market knowledge with global resources to deliver exceptional results for institutional and private clients.`,
            },
            {
                summary: `${contact.company} brings innovative approaches to traditional commercial real estate challenges. The firm focuses on data-driven decision making and cutting-edge technology to maximize value for clients. Their service offerings span across multiple property types, with particular strength in office and industrial sectors, and a growing practice in mixed-use developments.`,
            }
        ];

        const profile = companyProfiles[Math.floor(Math.random() * companyProfiles.length)];

        return {
            found: true,
            status: 'research_complete',
            activity_summary: profile.summary,
            activity_date: new Date().toISOString().split('T')[0],
            source_url: contact.company_website || `https://${contact.company.toLowerCase().replace(/\s+/g, '')}.com/about`,
            activity_type: 'company_research'
        };
    }

    // ============================================
    // Batch Research
    // ============================================

    async startBatchResearch(contactIds) {
        if (this.isProcessing) {
            showToast('Research already in progress. Please wait.', 'info');
            return;
        }

        this.isProcessing = true;
        this.researchQueue = [...contactIds];

        showToast(`Starting research for ${contactIds.length} contacts...`, 'info');

        for (const contactId of contactIds) {
            await this.startResearch(contactId);
            
            // Small delay between contacts
            await this.sleep(500);
        }

        this.isProcessing = false;
        this.researchQueue = [];

        showToast(`Batch research complete! ${contactIds.length} contacts researched.`, 'success');
    }

    // ============================================
    // Re-research with Context
    // ============================================

    async reResearch(contactId, feedbackContext) {
        const contact = this.contactManager.getContactById(contactId);
        
        if (!contact) return;

        showToast(`Re-researching ${contact.full_name}...`, 'info');

        // Update status
        this.contactManager.updateContact(contactId, {
            research_status: 'researching',
            research_feedback: feedbackContext
        });

        // Refresh UI
        if (window.contactUI) {
            window.contactUI.renderContacts();
        }

        // Run research with context
        const result = await this.runFiveStepResearch(contact, feedbackContext);

        // Update with new results
        this.contactManager.updateContact(contactId, {
            research_status: result.status,
            activity_summary: result.activity_summary,
            activity_date: result.activity_date,
            source_url: result.source_url,
            activity_type: result.activity_type,
            research_approved: false
        });

        // Refresh UI
        if (window.contactUI) {
            window.contactUI.renderContacts();
            window.contactUI.updateDashboardStats();
        }

        if (window.researchUI) {
            window.researchUI.renderApprovalSection();
        }

        showToast('Re-research complete! Please review the updated findings.', 'success');
    }

    // ============================================
    // Approval Actions
    // ============================================

    approveResearch(contactId) {
        const contact = this.contactManager.getContactById(contactId);
        
        if (!contact) return;

        this.contactManager.updateContact(contactId, {
            research_status: 'approved',
            research_approved: true
        });

        showToast(`Research approved for ${contact.full_name}! Ready to generate icebreakers.`, 'success');

        // Refresh UI
        if (window.contactUI) {
            window.contactUI.renderContacts();
            window.contactUI.updateDashboardStats();
        }

        if (window.researchUI) {
            window.researchUI.renderApprovalSection();
        }
    }

    rejectResearch(contactId) {
        const contact = this.contactManager.getContactById(contactId);
        
        if (!contact) return;

        this.contactManager.updateContact(contactId, {
            research_status: 'no_activity',
            research_approved: false,
            research_feedback: 'Rejected by user'
        });

        showToast(`Research rejected for ${contact.full_name}. No activity recorded.`, 'info');

        // Refresh UI
        if (window.contactUI) {
            window.contactUI.renderContacts();
            window.contactUI.updateDashboardStats();
        }

        if (window.researchUI) {
            window.researchUI.renderApprovalSection();
        }
    }

    // ============================================
    // Utility Functions
    // ============================================

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setUserAlumniSchool(school) {
        this.userAlumniSchool = school;
    }
}

// Export for global access
window.ResearchEngine = ResearchEngine;