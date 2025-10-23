/**
 * Learning Engine
 * Analyzes feedback data to identify patterns and generate improvement suggestions
 */

class LearningEngine {
    constructor(feedbackUI) {
        this.feedbackUI = feedbackUI;
        this.suggestionsKey = 'icebreaking_style_suggestions';
    }

    /**
     * Analyze all feedback data and generate suggestions
     * @returns {Object} Analysis results
     */
    analyzeFeedback() {
        const allFeedback = this.feedbackUI.getAllFeedback();
        
        if (allFeedback.length === 0) {
            console.log('[LearningEngine] No feedback to analyze');
            return null;
        }

        console.log(`[LearningEngine] Analyzing ${allFeedback.length} feedback entries...`);

        // Perform various analyses
        const overallAnalysis = this.analyzeOverallRatings(allFeedback);
        const phraseAnalysis = this.analyzePhrases(allFeedback);
        const patternAnalysis = this.analyzePatterns(allFeedback);
        
        // Generate suggestions
        const suggestions = this.generateSuggestions(overallAnalysis, phraseAnalysis, patternAnalysis);
        
        // Save suggestions for display in Settings
        this.saveSuggestions(suggestions);
        
        console.log('[LearningEngine] Analysis complete:', suggestions);
        
        return {
            overall: overallAnalysis,
            phrases: phraseAnalysis,
            patterns: patternAnalysis,
            suggestions: suggestions
        };
    }

    /**
     * Analyze overall rating statistics
     * @param {Array} feedbackList - Array of feedback objects
     * @returns {Object} Overall analysis
     */
    analyzeOverallRatings(feedbackList) {
        const totalCount = feedbackList.length;
        const totalRating = feedbackList.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = totalRating / totalCount;
        
        // Count by rating
        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbackList.forEach(f => {
            ratingCounts[f.rating]++;
        });
        
        // Calculate percentages
        const ratingPercentages = {};
        for (let rating in ratingCounts) {
            ratingPercentages[rating] = ((ratingCounts[rating] / totalCount) * 100).toFixed(1);
        }
        
        // Identify trends
        const positiveCount = ratingCounts[4] + ratingCounts[5];
        const negativeCount = ratingCounts[1] + ratingCounts[2];
        const neutralCount = ratingCounts[3];
        
        return {
            total_feedback: totalCount,
            average_rating: parseFloat(averageRating.toFixed(2)),
            rating_counts: ratingCounts,
            rating_percentages: ratingPercentages,
            positive_count: positiveCount,
            negative_count: negativeCount,
            neutral_count: neutralCount,
            positive_percentage: ((positiveCount / totalCount) * 100).toFixed(1),
            negative_percentage: ((negativeCount / totalCount) * 100).toFixed(1)
        };
    }

    /**
     * Analyze phrases from feedback
     * @param {Array} feedbackList - Array of feedback objects
     * @returns {Object} Phrase analysis
     */
    analyzePhrases(feedbackList) {
        const phraseRatings = {};
        
        // Extract and rate phrases
        feedbackList.forEach(feedback => {
            const phrases = this.extractKeyPhrases(feedback.icebreaker_text);
            phrases.forEach(phrase => {
                if (!phraseRatings[phrase]) {
                    phraseRatings[phrase] = {
                        phrase: phrase,
                        ratings: [],
                        count: 0
                    };
                }
                phraseRatings[phrase].ratings.push(feedback.rating);
                phraseRatings[phrase].count++;
            });
        });
        
        // Calculate average ratings for phrases
        const phraseStats = Object.values(phraseRatings).map(item => {
            const avgRating = item.ratings.reduce((sum, r) => sum + r, 0) / item.ratings.length;
            return {
                phrase: item.phrase,
                average_rating: parseFloat(avgRating.toFixed(2)),
                count: item.count
            };
        });
        
        // Sort by rating
        phraseStats.sort((a, b) => b.average_rating - a.average_rating);
        
        // Identify high and low performers
        const highPerformers = phraseStats.filter(p => p.average_rating >= 4 && p.count >= 2);
        const lowPerformers = phraseStats.filter(p => p.average_rating <= 2 && p.count >= 2);
        
        return {
            all_phrases: phraseStats,
            high_performers: highPerformers.slice(0, 10), // Top 10
            low_performers: lowPerformers.slice(0, 10), // Bottom 10
            total_unique_phrases: phraseStats.length
        };
    }

    /**
     * Extract key phrases from icebreaker text
     * @param {string} text - Icebreaker text
     * @returns {Array} Array of key phrases
     */
    extractKeyPhrases(text) {
        // Split into sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const phrases = [];
        
        // Extract common patterns
        const patterns = [
            /I (saw|noticed|read) (your|that)/i,
            /would love to/i,
            /caught my attention/i,
            /impressed by/i,
            /congratulations on/i,
            /fellow .+ (alum|graduate)/i,
            /small world/i,
            /reaching out/i,
            /looking forward/i,
            /great to connect/i
        ];
        
        patterns.forEach(pattern => {
            const match = text.match(pattern);
            if (match) {
                phrases.push(match[0].toLowerCase());
            }
        });
        
        // Also extract first 5-7 words of each sentence (opening phrases)
        sentences.forEach(sentence => {
            const words = sentence.trim().split(/\s+/);
            if (words.length >= 3) {
                const opening = words.slice(0, Math.min(5, words.length)).join(' ').toLowerCase();
                phrases.push(opening);
            }
        });
        
        return [...new Set(phrases)]; // Remove duplicates
    }

    /**
     * Analyze patterns in feedback
     * @param {Array} feedbackList - Array of feedback objects
     * @returns {Object} Pattern analysis
     */
    analyzePatterns(feedbackList) {
        // Analyze by icebreaker type
        const typeA = feedbackList.filter(f => f.icebreaker_type === 'a');
        const typeB = feedbackList.filter(f => f.icebreaker_type === 'b');
        
        const avgRatingA = typeA.length > 0 
            ? typeA.reduce((sum, f) => sum + f.rating, 0) / typeA.length 
            : 0;
        const avgRatingB = typeB.length > 0 
            ? typeB.reduce((sum, f) => sum + f.rating, 0) / typeB.length 
            : 0;
        
        // Analyze feedback over time (last 7 days vs. earlier)
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentFeedback = feedbackList.filter(f => new Date(f.created_date) >= sevenDaysAgo);
        const olderFeedback = feedbackList.filter(f => new Date(f.created_date) < sevenDaysAgo);
        
        const avgRatingRecent = recentFeedback.length > 0
            ? recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length
            : 0;
        const avgRatingOlder = olderFeedback.length > 0
            ? olderFeedback.reduce((sum, f) => sum + f.rating, 0) / olderFeedback.length
            : 0;
        
        // Calculate improvement trend
        const trend = avgRatingRecent > avgRatingOlder ? 'improving' 
                    : avgRatingRecent < avgRatingOlder ? 'declining' 
                    : 'stable';
        
        return {
            by_type: {
                type_a: {
                    count: typeA.length,
                    average_rating: parseFloat(avgRatingA.toFixed(2))
                },
                type_b: {
                    count: typeB.length,
                    average_rating: parseFloat(avgRatingB.toFixed(2))
                },
                better_performer: avgRatingA > avgRatingB ? 'A' : avgRatingB > avgRatingA ? 'B' : 'Equal'
            },
            by_time: {
                recent_7_days: {
                    count: recentFeedback.length,
                    average_rating: parseFloat(avgRatingRecent.toFixed(2))
                },
                older: {
                    count: olderFeedback.length,
                    average_rating: parseFloat(avgRatingOlder.toFixed(2))
                },
                trend: trend
            }
        };
    }

    /**
     * Generate actionable suggestions based on analysis
     * @param {Object} overallAnalysis - Overall rating analysis
     * @param {Object} phraseAnalysis - Phrase analysis
     * @param {Object} patternAnalysis - Pattern analysis
     * @returns {Array} Array of suggestion objects
     */
    generateSuggestions(overallAnalysis, phraseAnalysis, patternAnalysis) {
        const suggestions = [];
        
        // Suggestion 1: Overall performance
        if (overallAnalysis.average_rating < 3) {
            suggestions.push({
                type: 'critical',
                category: 'overall_performance',
                title: 'Low Average Rating',
                message: `Your icebreakers have an average rating of ${overallAnalysis.average_rating}/5. Consider reviewing your approach and incorporating more personalized details.`,
                action: 'Review low-rated icebreakers and identify common issues'
            });
        } else if (overallAnalysis.average_rating >= 4) {
            suggestions.push({
                type: 'positive',
                category: 'overall_performance',
                title: 'Strong Performance',
                message: `Excellent work! Your icebreakers average ${overallAnalysis.average_rating}/5. Keep using what's working.`,
                action: 'Continue current strategies'
            });
        }
        
        // Suggestion 2: Low-performing phrases
        if (phraseAnalysis.low_performers.length > 0) {
            const bannedPhrases = phraseAnalysis.low_performers.slice(0, 3).map(p => p.phrase);
            suggestions.push({
                type: 'warning',
                category: 'banned_phrases',
                title: 'Phrases to Avoid',
                message: `These phrases consistently receive low ratings: ${bannedPhrases.join(', ')}`,
                action: 'Consider removing these from your icebreakers',
                phrases: bannedPhrases
            });
        }
        
        // Suggestion 3: High-performing phrases
        if (phraseAnalysis.high_performers.length > 0) {
            const approvedPhrases = phraseAnalysis.high_performers.slice(0, 3).map(p => p.phrase);
            suggestions.push({
                type: 'positive',
                category: 'approved_phrases',
                title: 'Effective Phrases',
                message: `These phrases consistently receive high ratings: ${approvedPhrases.join(', ')}`,
                action: 'Use these patterns more frequently',
                phrases: approvedPhrases
            });
        }
        
        // Suggestion 4: Type preference
        if (patternAnalysis.by_type.better_performer !== 'Equal') {
            const betterType = patternAnalysis.by_type.better_performer;
            const betterRating = patternAnalysis.by_type[`type_${betterType.toLowerCase()}`].average_rating;
            suggestions.push({
                type: 'info',
                category: 'type_preference',
                title: `Icebreaker ${betterType} Performs Better`,
                message: `Type ${betterType} icebreakers average ${betterRating}/5, outperforming the alternative.`,
                action: `Analyze what makes Type ${betterType} more effective`
            });
        }
        
        // Suggestion 5: Trend analysis
        if (patternAnalysis.by_time.trend === 'improving') {
            suggestions.push({
                type: 'positive',
                category: 'trend',
                title: 'Improving Over Time',
                message: 'Your recent icebreakers are rated higher than earlier ones. You\'re learning what works!',
                action: 'Continue your current approach'
            });
        } else if (patternAnalysis.by_time.trend === 'declining') {
            suggestions.push({
                type: 'warning',
                category: 'trend',
                title: 'Recent Decline',
                message: 'Recent icebreakers are rated lower than earlier ones. Consider revisiting successful patterns.',
                action: 'Review what changed in your recent icebreakers'
            });
        }
        
        // Suggestion 6: Sample size
        if (overallAnalysis.total_feedback < 5) {
            suggestions.push({
                type: 'info',
                category: 'data_collection',
                title: 'Limited Feedback Data',
                message: `You have ${overallAnalysis.total_feedback} feedback entries. More data will improve suggestions.`,
                action: 'Continue collecting feedback on your icebreakers'
            });
        }
        
        return suggestions;
    }

    /**
     * Save suggestions to Settings for display in Settings UI
     * @param {Array} suggestions - Array of suggestion objects
     */
    saveSuggestions(suggestions) {
        try {
            // Save to SettingsModel if available (new approach)
            if (window.SettingsModel) {
                const currentSettings = window.SettingsModel.load();
                
                // Convert suggestions to pending_style_suggestions format
                const pendingSuggestions = suggestions
                    .filter(s => s.category === 'banned_phrases' || s.category === 'approved_phrases')
                    .map((s, index) => ({
                        id: `suggestion_${Date.now()}_${index}`,
                        type: s.category === 'banned_phrases' ? 'remove_phrase' : 'add_phrase',
                        severity: s.type === 'critical' ? 'critical' : s.type === 'warning' ? 'warning' : 'info',
                        message: s.message,
                        phrases: s.phrases || [],
                        target_list: s.category === 'banned_phrases' ? 'banned' : 'approved',
                        created_at: new Date().toISOString()
                    }));
                
                // Merge with existing pending suggestions (don't replace)
                const existingPending = currentSettings.pending_style_suggestions || [];
                const mergedSuggestions = [...existingPending];
                
                // Only add new suggestions that aren't already present
                pendingSuggestions.forEach(newSugg => {
                    const exists = mergedSuggestions.some(existing => 
                        existing.message === newSugg.message
                    );
                    if (!exists) {
                        mergedSuggestions.push(newSugg);
                    }
                });
                
                window.SettingsModel.set('pending_style_suggestions', mergedSuggestions);
                console.log(`[LearningEngine] ${pendingSuggestions.length} suggestions written to SettingsModel`);
            }
            
            // Also save to legacy storage for backward compatibility
            const data = {
                suggestions: suggestions,
                generated_at: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.suggestionsKey, JSON.stringify(data));
            console.log('[LearningEngine] Suggestions saved');
        } catch (error) {
            console.error('[LearningEngine] Error saving suggestions:', error);
        }
    }

    /**
     * Get saved suggestions
     * @returns {Array} Array of suggestion objects
     */
    getSuggestions() {
        try {
            const stored = localStorage.getItem(this.suggestionsKey);
            if (stored) {
                const data = JSON.parse(stored);
                return data.suggestions || [];
            }
        } catch (error) {
            console.error('[LearningEngine] Error loading suggestions:', error);
        }
        return [];
    }

    /**
     * Get learning insights for display
     * @returns {Object} Insights object
     */
    getInsights() {
        const allFeedback = this.feedbackUI.getAllFeedback();
        
        if (allFeedback.length === 0) {
            return {
                ready: false,
                message: 'No feedback data available yet. Start rating your icebreakers to see insights.'
            };
        }
        
        const overallAnalysis = this.analyzeOverallRatings(allFeedback);
        const phraseAnalysis = this.analyzePhrases(allFeedback);
        const patternAnalysis = this.analyzePatterns(allFeedback);
        const suggestions = this.getSuggestions();
        
        return {
            ready: true,
            overall: overallAnalysis,
            top_phrases: phraseAnalysis.high_performers.slice(0, 5),
            avoid_phrases: phraseAnalysis.low_performers.slice(0, 5),
            performance_trend: patternAnalysis.by_time.trend,
            suggestions: suggestions
        };
    }

    /**
     * Clear all suggestions
     */
    clearSuggestions() {
        try {
            localStorage.removeItem(this.suggestionsKey);
            console.log('[LearningEngine] Suggestions cleared');
        } catch (error) {
            console.error('[LearningEngine] Error clearing suggestions:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningEngine;
}
