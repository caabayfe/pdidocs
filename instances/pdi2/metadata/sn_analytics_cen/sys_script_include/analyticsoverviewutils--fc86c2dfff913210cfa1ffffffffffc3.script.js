var AnalyticsOverviewUtils = Class.create();
AnalyticsOverviewUtils.prototype = {
    initialize: function() {
        this.PREFIX = '[AnalyticsOverviewUtils]';
        this.STATE = {
            COLLECTED_ERROR: 'collected_error',
            COLLECTED_WARNING: 'collected_warning',
            COLLECTING: 'collecting',
            COLLECTED_OK: 'collected_ok'
        };
        this.ONE_HOUR_MS = gs.getDurationDate('0 1:0:0');
    },

    /**
     * Returns the latest job log record for a PA job
     * @param {string} jobId - The job ID to query
     * @returns {GlideRecord|null} The latest job log or null
     */
    getLatestPAJobLog: function(jobId) {
        try {
            const logGr = new GlideRecordSecure('pa_job_logs');
            logGr.addQuery('job', jobId);
            logGr.orderByDesc('sys_created_on');
            logGr.setLimit(1);
            logGr.query();

            return logGr.next() ? logGr : null;
        } catch (e) {
            this._logError('getLatestPAJobLog', `jobId: ${jobId}`, e);
            return null;
        }
    },

    /**
     * Returns log sys_ids for jobs in collected_error state
     * @returns {Array} Array of log sys_ids
     */
    getErrorPAJobLogs: function() {
        return this._getJobLogsByState(this.STATE.COLLECTED_ERROR, 'getErrorPAJobLogs');
    },

    /**
     * Returns log sys_ids for jobs in collected_warning state
     * @returns {Array} Array of log sys_ids
     */
    getWarningPAJobLogs: function() {
        return this._getJobLogsByState(this.STATE.COLLECTED_WARNING, 'getWarningPAJobLogs');
    },

    /**
     * Returns log sys_ids for jobs still collecting for >= 1 hour
     * @returns {Array} Array of log sys_ids
     */
    getRunningPAJobLogsOverAnHour: function() {
        const logs = [];

        try {
            const activeJobs = this._getActivePAJobs();

            while (activeJobs.next()) {
                const jobId = activeJobs.getUniqueValue();

                try {
                    const latestLog = this.getLatestPAJobLog(jobId);
                    if (!latestLog) continue;

                    const state = latestLog.getValue('state');
                    const runTime = latestLog.getValue('run_time');

                    if (state === this.STATE.COLLECTING && runTime >= this.ONE_HOUR_MS) {
                        logs.push(latestLog.getUniqueValue());
                    }
                } catch (e) {
                    this._logError('getRunningPAJobLogsOverAnHour', `job: ${jobId}`, e);
                }
            }
        } catch (e) {
            this._logError('getRunningPAJobLogsOverAnHour', null, e);
        }

        return logs;
    },

    /**
     * Private helper: Gets active PA jobs
     * @returns {GlideRecord} Active PA jobs query result
     * @private
     */
    _getActivePAJobs: function() {
        const gr = new GlideRecordSecure('sysauto_pa');
        gr.addActiveQuery();
        gr.query();
        return gr;
    },

    /**
     * Private helper: Gets job logs filtered by state
     * @param {string} targetState - The state to filter by
     * @param {string} methodName - The calling method name for logging
     * @returns {Array} Array of log sys_ids
     * @private
     */
    _getJobLogsByState: function(targetState, methodName) {
        const logs = [];

        try {
            const activeJobs = this._getActivePAJobs();

            while (activeJobs.next()) {
                const jobId = activeJobs.getUniqueValue();

                try {
                    const latestLog = this.getLatestPAJobLog(jobId);
                    if (!latestLog) continue;

                    const state = latestLog.getValue('state');
                    if (state === targetState) {
                        logs.push(latestLog.getUniqueValue());
                    }
                } catch (e) {
                    this._logError(methodName, `job: ${jobId}`, e);
                }
            }
        } catch (e) {
            this._logError(methodName, null, e);
        }

        return logs;
    },

    /**
     * Private helper: Logs errors with consistent formatting
     * @param {string} methodName - The method where error occurred
     * @param {string} context - Additional context information
     * @param {Error} error - The error object
     * @private
     */
    _logError: function(methodName, context, error) {
        const contextStr = context ? ` - ${context}` : '';
        const errorMsg = error && error.message ? `: ${error.message}` : '';
        gs.error(`${this.PREFIX} Error in ${methodName}${contextStr}${errorMsg}`);
    },

    type: 'AnalyticsOverviewUtils'
};
