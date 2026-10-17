var SGTScanHistoryDAO = Class.create();
SGTScanHistoryDAO.prototype = {
    initialize: function() {
        this.SCAN_HISTORY_TABLE_NAME = 'sgt_scan_history';
        this.NOT_SCRIPTED_IN_DAYS = 'not_scripted_in_days';
        this.SYS_ID = 'sys_id';
        this.STATUS = 'status';
        this.JOB_STATUS = {
            IN_PROGRESS: 'in_progress',
            SCHEDULED: 'scheduled',
            CANCELLED: 'cancelled',
            COMPLETED: 'completed',
            ERROR: 'error'
        };
        this.COMPLETED_TIME = 'completed_time';
        this.SCHEDULED_TIME = 'scheduled_time';
        this.MANUAL_SCAN = 'manual_scan';
    },

    create: function(scheduledTime, notScriptedInDays, isManualScan) {
        try {
            var gr = new GlideRecord(this.SCAN_HISTORY_TABLE_NAME);
            gr.initialize();
            gr.setValue(this.STATUS, this.JOB_STATUS.SCHEDULED);
            gr.setValue(this.SCHEDULED_TIME, scheduledTime);
            gr.setValue(this.NOT_SCRIPTED_IN_DAYS, notScriptedInDays);
            gr.setValue(this.MANUAL_SCAN, isManualScan === undefined ? false : isManualScan);
            return gr.insert();
        } catch (e) {
            gs.error('Scripting Governance Tool: Error while saving data in scan_history table ' + e);
        }
        return null;
    },


    getScanHistory: function(sysId) {
        var gr = new GlideRecord(this.SCAN_HISTORY_TABLE_NAME);
        gr.addQuery(this.SYS_ID, sysId);
        gr.query();
        var res = {};
        if (gr.next()) {
            res = {
                scanNumber: gr.getValue('scan_number'),
                scheduledTime: gr.getValue('scheduled_time'),
                completedTime: gr.getValue('completed_time'),
                notScriptedInDays: parseInt(gr.getValue('not_scripted_in_days')),
                isManualScan: gr.getValue('manual_scan') === "1",
                status: gr.getValue('status')
            };
        }
        return res;
    },

    updateStatus: function(scanID, status) {
        var scanRequestGR = this._findScanHistoryGR(scanID);
        if (scanRequestGR.next()) {
            scanRequestGR.setValue(this.STATUS, status);
            if (status == this.JOB_STATUS.COMPLETED) {
                scanRequestGR.setValue(this.COMPLETED_TIME, new GlideDateTime());
            }
            scanRequestGR.update();
        }
    },

    isAnyJobScheduledOrRunning: function() {
        var gr = new GlideRecord(this.SCAN_HISTORY_TABLE_NAME);
        gr.addQuery(this.STATUS, this.JOB_STATUS.SCHEDULED).addOrCondition(this.STATUS, this.JOB_STATUS.IN_PROGRESS);
        gr.setLimit(1);
        gr.query();
        return gr.next();
    },

    isJobCancelled: function(scanID) {
        var scanRequestGR = this._findScanHistoryGR(scanID);
        return scanRequestGR.next() && scanRequestGR.getValue(this.STATUS) == this.JOB_STATUS.CANCELLED;
    },

    getDaysToAudit: function(scanID) {
        var scanRequestGR = this._findScanHistoryGR(scanID);
        if (scanRequestGR.next()) {
            return scanRequestGR.getValue(this.NOT_SCRIPTED_IN_DAYS);
        }
        return null;
    },

    getJobScheduledTime: function(scanID) {
        var scanRequestGR = this._findScanHistoryGR(scanID);
        if (scanRequestGR.next()) {
            return scanRequestGR.getValue(this.SCHEDULED_TIME);
        }
        gs.error('Scripting Governance Tool: Unable to find the job scheduled time for scan ID ' + scanID);
        return null;
    },

    _findScanHistoryGR: function(scanID) {
        var scanRequestGR = new GlideRecord(this.SCAN_HISTORY_TABLE_NAME);
        scanRequestGR.addQuery(this.SYS_ID, scanID);
        scanRequestGR.query();
        return scanRequestGR;
    },

    getLastNCompletedScans: function(limit) {
        var scans = [];
        var scanHistoryGR = new GlideRecord(this.SCAN_HISTORY_TABLE_NAME);
        scanHistoryGR.addQuery(this.MANUAL_SCAN, false);
        scanHistoryGR.orderByDesc(this.COMPLETED_TIME);
        scanHistoryGR.setLimit(limit);
        scanHistoryGR.query();
        while (scanHistoryGR.next()) {
            scans.push(scanHistoryGR.getUniqueValue());
        }
        return scans;
    },

    type: 'SGTScanHistoryDAO'
};
