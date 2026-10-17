var PurgeAuditRecordEstimator = Class.create();
PurgeAuditRecordEstimator.prototype = {
    initialize: function() {},

    /**
     * Fetches the number of audit records for a given table
     * @param {string} tableName - The name of the table to check
     * @returns {number} Number of audit records or 0 if error occurs
     */
    getAuditRecordsByTable: function(tableName) {
        try {
            var stats = new SNC.StorageStatsAPI().getEstimatedAuditStats(tableName);
            var parsed = JSON.parse(stats);
            return parseInt(parsed.rowCount) || 0;
        } catch (e) {
            gs.error("Error fetching audit stats for table " + tableName + ": " + e.message);
            return 0;
        }
    },

    /**
     * Calculates record estimation details based on retention period
     * @param {string} tableName - The name of the table
     * @param {string} retentionChoice - The retention period choice
     * @param {number} totalAuditRecords - (Optional) Pre-fetched total records count
     * @returns {Object} Object containing count, percentage, and totalRecordCount
     */
    getRecordEstimationDetails: function(tableName, retentionChoice, totalAuditRecords) {
        // If totalAuditRecords is not provided, fetch it
        if (totalAuditRecords === undefined || totalAuditRecords === null) {
            totalAuditRecords = this.getAuditRecordsByTable(tableName);
        }

        // Ensure totalAuditRecords is a valid number
        totalAuditRecords = parseInt(totalAuditRecords) || 0;

        var createdOn = this._getTableCreatedOn(tableName);
        if (!createdOn) {
            gs.error("Table '" + tableName + "' not found or invalid creation date.");
            return this._getDefaultResponse(0);
        }

        if (totalAuditRecords === 0) {
            return this._getDefaultResponse(0);
        }

        var retentionMonths = this._getRetentionMonths(retentionChoice);
        if (retentionMonths === null) {
            gs.error("Invalid retention choice: " + retentionChoice);
            return this._getDefaultResponse(totalAuditRecords);
        }

        var now = new GlideDateTime();
        var ratio = this._calculateRetentionRatio(now, createdOn, retentionMonths);
        ratio = Math.min(ratio, 1); // Ensure ratio doesn't exceed 1

        var recordsToDelete = Math.round(totalAuditRecords * ratio);
        var percentage = Math.round((recordsToDelete / totalAuditRecords) * 100);

        return {
            count: recordsToDelete,
            percentage: percentage,
            totalRecordCount: totalAuditRecords
        };
    },

    _getRetentionMonths: function(retentionChoice) {
        var retentionMap = {
            "1 Month": 1,
            "6 Months": 6,
            "1 Year": 12,
            "3 Years": 36,
            "5 Years": 60,
            "7 Years": 84
        };
        return retentionMap[retentionChoice] || null;
    },

    _calculateRetentionRatio: function(now, createdOn, retentionMonths) {
        var cutoffDate = new GlideDateTime(now);
        cutoffDate.addMonthsUTC(-retentionMonths);

        // need to create new Object with the cutOffDate as getNumericValue behaves differently when months are added/subtracted form GDT object
        var cutOffDateObject = new GlideDateTime(cutoffDate);

        var totalAge = now.getNumericValue() - createdOn.getNumericValue();
        var cutoffAge = cutOffDateObject.getNumericValue() - createdOn.getNumericValue();

        if (totalAge <= 0 || cutoffAge <= 0) {
            return 0;
        }

        return Math.max(0, Math.min(cutoffAge / totalAge, 1));
    },

    _getTableCreatedOn: function(tableName) {
        var gr = new GlideRecord("sys_db_object");
        gr.addQuery("name", tableName);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? new GlideDateTime(gr.sys_created_on) : null;
    },

    _getDefaultResponse: function(totalRecords) {
        return {
            count: 0,
            percentage: 0,
            totalRecordCount: totalRecords || 0
        };
    },

    type: 'PurgeAuditRecordEstimator'
};
