/**
 * Feedback UI
 * Modal component for collecting user feedback on generated icebreakers
 */

class FeedbackUI {
    constructor(contactManager, learningEngine) {
        this.contactManager = contactManager;
        this.learningEngine = learningEngine;
        this.storageKey = 'icebreaking_feedback';
        this.phrasesKey = 'icebreaking_phrases';
        this.currentFeedback = null;
    }

    /**
     * Show feedback modal for a specific icebreaker
     * @param {string} contactId - Contact ID
     * @param {string} icebreakerType - 'a' or 'b'
     */
    showFeedbackModal(contactId, icebreakerType) {
        const contact = this.contactManager.getContactById(contactId);
        if (!contact) {
            console.error('[FeedbackUI] Contact not found:', contactId);
            return;
        }

        const icebreakerText = icebreakerType === 'a' ? contact.icebreaker_a : contact.icebreaker_b;
        if (!icebreakerText) {
            console.error('[FeedbackUI] Icebreaker text not found');
            return;
        }

        // Store current feedback context
        this.currentFeedback = {
            contact_id: contactId,
            icebreaker_type: icebreakerType,
            icebreaker_text: icebreakerText,
            contact_name: contact.name,
            company: contact.company,
            activity_summary: contact.activity_summary
        };

        // Create and show modal
        this.renderModal();
        this.attachModalListeners();
    }

    /**
     * Render the feedback modal
     */
    renderModal() {
        const { contact_name, company, activity_summary, icebreaker_text, icebreaker_type } = this.currentFeedback;

        const modalHTML = `
            <div class="modal-overlay" id="feedback-modal-overlay">
                <div class="modal-content feedback-modal">
                    <div class="modal-header">
                        <h2>
                            <i class="fas fa-comment-dots"></i>
                            Icebreaker Feedback
                        </h2>
                        <button class="modal-close" id="feedback-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body">
                        <!-- Contact Info -->
                        <div class="feedback-contact-info">
                            <h3>${contact_name}</h3>
                            <p class="company">${company}</p>
                            ${activity_summary ? `<p class="activity-summary">${activity_summary}</p>` : ''}
                        </div>

                        <!-- Selected Icebreaker -->
                        <div class="feedback-icebreaker">
                            <label>Icebreaker ${icebreaker_type.toUpperCase()}:</label>
                            <div class="icebreaker-text">${icebreaker_text}</div>
                        </div>

                        <!-- Rating System -->
                        <div class="feedback-rating">
                            <label>Rate this icebreaker:</label>
                            <div class="star-rating" id="star-rating">
                                ${this.renderStars()}
                            </div>
                            <span class="rating-label" id="rating-label">Select a rating</span>
                        </div>

                        <!-- Feedback Notes -->
                        <div class="form-group">
                            <label for="feedback-notes">What worked or didn't work?</label>
                            <textarea 
                                id="feedback-notes" 
                                rows="3" 
                                placeholder="Share your thoughts on this icebreaker..."
                            ></textarea>
                        </div>

                        <!-- Improvement Suggestions -->
                        <div class="form-group">
                            <label for="improvement-suggestions">How would you improve this?</label>
                            <textarea 
                                id="improvement-suggestions" 
                                rows="3" 
                                placeholder="Suggest improvements or alternative approaches..."
                            ></textarea>
                        </div>

                        <!-- Phrase Management -->
                        <div class="feedback-phrases">
                            <h4>Phrase Management</h4>
                            <div class="phrase-checkboxes">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="add-banned-phrases">
                                    <span>Add phrases to banned list</span>
                                    <small>Extract and avoid phrases that didn't work</small>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="add-approved-phrases">
                                    <span>Add phrases to approved list</span>
                                    <small>Extract and reuse effective phrases</small>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="feedback-cancel">Cancel</button>
                        <button class="btn btn-primary" id="feedback-submit">
                            <i class="fas fa-save"></i>
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('feedback-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal with animation
        setTimeout(() => {
            const overlay = document.getElementById('feedback-modal-overlay');
            if (overlay) {
                overlay.classList.add('active');
            }
        }, 10);
    }

    /**
     * Render star rating system
     * @returns {string} HTML for stars
     */
    renderStars() {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `
                <i class="star fas fa-star" data-rating="${i}"></i>
            `;
        }
        return starsHTML;
    }

    /**
     * Attach event listeners to modal elements
     */
    attachModalListeners() {
        // Close button
        const closeBtn = document.getElementById('feedback-modal-close');
        const cancelBtn = document.getElementById('feedback-cancel');
        const overlay = document.getElementById('feedback-modal-overlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        }

        // Star rating
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => this.handleStarClick(e));
            star.addEventListener('mouseenter', (e) => this.handleStarHover(e));
        });

        const starContainer = document.getElementById('star-rating');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', () => this.resetStarHover());
        }

        // Submit button
        const submitBtn = document.getElementById('feedback-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }
    }

    /**
     * Handle star click
     * @param {Event} e - Click event
     */
    handleStarClick(e) {
        const rating = parseInt(e.target.getAttribute('data-rating'));
        this.currentFeedback.rating = rating;

        // Update star display
        this.updateStarDisplay(rating);

        // Update label
        const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        const label = document.getElementById('rating-label');
        if (label) {
            label.textContent = labels[rating - 1];
            label.className = 'rating-label active';
        }
    }

    /**
     * Handle star hover
     * @param {Event} e - Hover event
     */
    handleStarHover(e) {
        const rating = parseInt(e.target.getAttribute('data-rating'));
        this.updateStarDisplay(rating, true);
    }

    /**
     * Reset star hover effect
     */
    resetStarHover() {
        const currentRating = this.currentFeedback.rating || 0;
        this.updateStarDisplay(currentRating);
    }

    /**
     * Update star display
     * @param {number} rating - Rating value (1-5)
     * @param {boolean} isHover - Whether this is a hover state
     */
    updateStarDisplay(rating, isHover = false) {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.add('active');
                if (isHover && !this.currentFeedback.rating) {
                    star.classList.add('hover');
                }
            } else {
                star.classList.remove('active', 'hover');
            }
        });
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        // Validate rating
        if (!this.currentFeedback.rating) {
            this.showToast('Please select a rating', 'warning');
            return;
        }

        // Get form values
        const feedbackNotes = document.getElementById('feedback-notes')?.value || '';
        const improvementSuggestions = document.getElementById('improvement-suggestions')?.value || '';
        const addBanned = document.getElementById('add-banned-phrases')?.checked || false;
        const addApproved = document.getElementById('add-approved-phrases')?.checked || false;

        // Create feedback object
        const feedback = {
            id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            contact_id: this.currentFeedback.contact_id,
            icebreaker_type: this.currentFeedback.icebreaker_type,
            icebreaker_text: this.currentFeedback.icebreaker_text,
            rating: this.currentFeedback.rating,
            feedback_notes: feedbackNotes,
            improvement_suggestions: improvementSuggestions,
            created_date: new Date().toISOString()
        };

        // Save feedback
        this.saveFeedback(feedback);

        // Update phrase lists if checkboxes checked
        if (addBanned || addApproved) {
            this.updatePhraseLists(
                this.currentFeedback.icebreaker_text,
                addBanned,
                addApproved,
                this.currentFeedback.rating
            );
        }

        // Trigger learning engine analysis
        if (this.learningEngine) {
            this.learningEngine.analyzeFeedback();
        }

        // Show success message
        this.showToast('Feedback saved successfully!', 'success');

        // Close modal
        this.closeModal();

        // Refresh results library if it's visible
        if (window.resultsUI && document.getElementById('results-page')?.classList.contains('active')) {
            window.resultsUI.renderResultsLibrary();
        }
    }

    /**
     * Save feedback to localStorage
     * @param {Object} feedback - Feedback object
     */
    saveFeedback(feedback) {
        try {
            const feedbackList = this.getAllFeedback();
            feedbackList.push(feedback);
            localStorage.setItem(this.storageKey, JSON.stringify(feedbackList));
            console.log('[FeedbackUI] Feedback saved:', feedback.id);
        } catch (error) {
            console.error('[FeedbackUI] Error saving feedback:', error);
        }
    }

    /**
     * Get all feedback from localStorage
     * @returns {Array} Array of feedback objects
     */
    getAllFeedback() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[FeedbackUI] Error loading feedback:', error);
            return [];
        }
    }

    /**
     * Get feedback for a specific contact
     * @param {string} contactId - Contact ID
     * @returns {Array} Array of feedback objects
     */
    getFeedbackByContact(contactId) {
        const allFeedback = this.getAllFeedback();
        return allFeedback.filter(f => f.contact_id === contactId);
    }

    /**
     * Update phrase lists based on feedback
     * @param {string} icebreakerText - Icebreaker text
     * @param {boolean} addBanned - Add to banned list
     * @param {boolean} addApproved - Add to approved list
     * @param {number} rating - Feedback rating
     */
    updatePhraseLists(icebreakerText, addBanned, addApproved, rating) {
        const phrases = this.extractPhrases(icebreakerText);
        
        // Use SettingsModel if available (new approach)
        if (window.SettingsModel) {
            if (addBanned && rating <= 2) {
                phrases.forEach(phrase => {
                    window.SettingsModel.addBannedPhrase(phrase);
                });
                console.log('[FeedbackUI] Added phrases to banned list (SettingsModel):', phrases);
            }

            if (addApproved && rating >= 4) {
                phrases.forEach(phrase => {
                    window.SettingsModel.addApprovedPhrase(phrase);
                });
                console.log('[FeedbackUI] Added phrases to approved list (SettingsModel):', phrases);
            }
        } else {
            // Fallback to legacy localStorage approach
            const lists = this.getPhraseLists();

            if (addBanned && rating <= 2) {
                phrases.forEach(phrase => {
                    if (!lists.banned.includes(phrase)) {
                        lists.banned.push(phrase);
                    }
                });
                console.log('[FeedbackUI] Added phrases to banned list:', phrases);
            }

            if (addApproved && rating >= 4) {
                phrases.forEach(phrase => {
                    if (!lists.approved.includes(phrase)) {
                        lists.approved.push(phrase);
                    }
                });
                console.log('[FeedbackUI] Added phrases to approved list:', phrases);
            }

            this.savePhraseLists(lists);
        }
    }

    /**
     * Extract meaningful phrases from icebreaker text
     * @param {string} text - Icebreaker text
     * @returns {Array} Array of phrases
     */
    extractPhrases(text) {
        // Simple extraction - split by sentences and take key phrases
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        return sentences.map(s => s.trim()).slice(0, 3); // Take first 3 sentences/phrases
    }

    /**
     * Get phrase lists from localStorage
     * @returns {Object} { banned: [], approved: [] }
     */
    getPhraseLists() {
        try {
            const stored = localStorage.getItem(this.phrasesKey);
            return stored ? JSON.parse(stored) : { banned: [], approved: [] };
        } catch (error) {
            console.error('[FeedbackUI] Error loading phrase lists:', error);
            return { banned: [], approved: [] };
        }
    }

    /**
     * Save phrase lists to localStorage
     * @param {Object} lists - { banned: [], approved: [] }
     */
    savePhraseLists(lists) {
        try {
            localStorage.setItem(this.phrasesKey, JSON.stringify(lists));
        } catch (error) {
            console.error('[FeedbackUI] Error saving phrase lists:', error);
        }
    }

    /**
     * Close the feedback modal
     */
    closeModal() {
        const overlay = document.getElementById('feedback-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        this.currentFeedback = null;
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[Toast] ${type}: ${message}`);
        }
    }

    /**
     * Get feedback statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const allFeedback = this.getAllFeedback();
        
        if (allFeedback.length === 0) {
            return {
                total: 0,
                average_rating: 0,
                rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        const totalRating = allFeedback.reduce((sum, f) => sum + f.rating, 0);
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        allFeedback.forEach(f => {
            ratingDistribution[f.rating]++;
        });

        return {
            total: allFeedback.length,
            average_rating: (totalRating / allFeedback.length).toFixed(2),
            rating_distribution: ratingDistribution
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackUI;
}
