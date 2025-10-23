/**
 * Task Queue
 * Manages concurrent task execution with rate limiting
 * Prevents overwhelming AI providers with too many simultaneous requests
 */

class TaskQueue {
    /**
     * Create a new task queue
     * @param {number} concurrency - Maximum number of concurrent tasks (default: 2)
     * @param {number} delayBetweenTasks - Delay in ms between task starts (default: 0)
     */
    constructor(concurrency = 2, delayBetweenTasks = 0) {
        this.concurrency = concurrency;
        this.delayBetweenTasks = delayBetweenTasks;
        this.running = 0;
        this.queue = [];
        this.completed = 0;
        this.failed = 0;
        this.total = 0;
    }

    /**
     * Add a task to the queue
     * @param {Function} task - Async function to execute
     * @returns {Promise} Resolves when task completes
     */
    push(task) {
        this.total++;
        
        return new Promise((resolve, reject) => {
            this.queue.push({ 
                task, 
                resolve, 
                reject,
                id: this.total,
                addedAt: Date.now()
            });
            this._run();
        });
    }

    /**
     * Add multiple tasks at once
     * @param {Array<Function>} tasks - Array of async functions
     * @returns {Promise<Array>} Resolves when all tasks complete
     */
    pushAll(tasks) {
        const promises = tasks.map(task => this.push(task));
        return Promise.all(promises);
    }

    /**
     * Run tasks from the queue
     * @private
     */
    async _run() {
        while (this.running < this.concurrency && this.queue.length > 0) {
            const item = this.queue.shift();
            if (!item) continue;

            this.running++;
            
            const startTime = Date.now();
            console.log(`[TaskQueue] Starting task ${item.id} (${this.running}/${this.concurrency} running, ${this.queue.length} queued)`);

            try {
                // Add delay if specified
                if (this.delayBetweenTasks > 0 && this.completed > 0) {
                    await this._sleep(this.delayBetweenTasks);
                }

                // Execute the task
                const result = await Promise.resolve().then(item.task);
                
                const duration = Date.now() - startTime;
                console.log(`[TaskQueue] Task ${item.id} completed in ${duration}ms`);
                
                this.completed++;
                item.resolve(result);
            } catch (error) {
                const duration = Date.now() - startTime;
                console.error(`[TaskQueue] Task ${item.id} failed after ${duration}ms:`, error.message);
                
                this.failed++;
                item.reject(error);
            } finally {
                this.running--;
                this._run(); // Continue processing queue
            }
        }
    }

    /**
     * Wait for specified milliseconds
     * @private
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise}
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get queue status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            running: this.running,
            queued: this.queue.length,
            completed: this.completed,
            failed: this.failed,
            total: this.total,
            concurrency: this.concurrency
        };
    }

    /**
     * Wait for all tasks to complete
     * @returns {Promise} Resolves when queue is empty
     */
    async drain() {
        while (this.running > 0 || this.queue.length > 0) {
            await this._sleep(100);
        }
    }

    /**
     * Clear the queue
     */
    clear() {
        // Reject all queued tasks
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            if (item) {
                item.reject(new Error('Queue cleared'));
            }
        }
        
        console.log('[TaskQueue] Queue cleared');
    }

    /**
     * Reset statistics
     */
    reset() {
        this.completed = 0;
        this.failed = 0;
        this.total = 0;
    }

    /**
     * Update concurrency limit
     * @param {number} newConcurrency - New concurrency value
     */
    setConcurrency(newConcurrency) {
        if (newConcurrency < 1) {
            console.warn('[TaskQueue] Concurrency must be at least 1');
            return;
        }
        
        this.concurrency = newConcurrency;
        console.log(`[TaskQueue] Concurrency updated to ${newConcurrency}`);
        
        // Try to run more tasks if concurrency increased
        if (newConcurrency > this.running) {
            this._run();
        }
    }

    /**
     * Update delay between tasks
     * @param {number} newDelay - New delay in milliseconds
     */
    setDelay(newDelay) {
        this.delayBetweenTasks = Math.max(0, newDelay);
        console.log(`[TaskQueue] Delay between tasks updated to ${this.delayBetweenTasks}ms`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskQueue };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.TaskQueue = TaskQueue;
}
