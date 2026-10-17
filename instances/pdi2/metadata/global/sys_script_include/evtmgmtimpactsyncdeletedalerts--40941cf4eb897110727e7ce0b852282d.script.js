gs.include('EvtMgmtCommons');
gs.include('SlowStepJSManager');

var EvtMgmtImpactSyncDeletedAlerts = Class.create();
EvtMgmtImpactSyncDeletedAlerts.prototype = {
    initialize: function() {
        this.MAX_DATE = '8994-08-17 07:12:55';
        this.CLOSED_STATE = 'Closed';
        this.IGNORED_COLUMNS = ['sys_meta', 'sys_id', 'sys_created_on', 'sys_created_by', 'sys_updated_by'];
        this.CLEANUP_AGE_DAYS = this.getIntPropertyValue('evt_mgmt.impact_calculation.dangling_cleanup_age_days.em_alert_history', 90); 
        this.MAX_ALERTS_TO_HANDLE = this.getIntPropertyValue('evt_mgmt.impact_calculation.dangling_cleanup_max_alerts', 500);
        this.NEXT_RUN_HASH = "impact_sync_deleted_next_run";
        this.LAST_HANDLED_ALERT = "impact_sync_deleted_last_handled_alert";
        this.MINUTES_BETWEEN_JOB_RUNS = this.getIntPropertyValue("evt_mgmt.impact_calculation.dangling_cleanup__minutes_between_job_run", 1440); // 1 day in minutes
        this.ALERT_HIST_TABLE_NAME = 'em_alert_history';
        this.ALERT_SYS_ID_COL = 'alert_sys_id';
        this.VT_START_COL = 'vt_start';
        this.VT_END_COL = 'vt_end';
        this.STATE_COL = 'state';
        this.NUMBER_COL = 'number';
        this.SYS_UPDATED_COL = 'sys_updated_on';
        this.OPEN_COL = 'open';
        this.evtMgmtCommons = new global.EvtMgmtCommons();
        this.slowStepManager = new global.SlowStepJSManager();
        this.jobNextRunDateHashTime = null;
        this.logStr = 'EvtMgmtImpactSyncDeletedAlerts - ';
    },

    sync: function() {
        try {
            var startTime = new GlideDateTime();
            this.slowStepManager.setTopic("Sync Deleted Alerts");

            if (!this.isTimeToRun()) {
                this.slowStepManager.report();
                return;
            }
            var allAlertsProcessed = this.handleEmptyAlertSysIds();

            if (allAlertsProcessed) {
                allAlertsProcessed = this.handleNonEmptyAlertSysIds();
            }
            if (allAlertsProcessed) {
                this.slowStepManager.startStep('Set Hash');
                this.jobNextRunDateHashTime.addDays(1);
                this.evtMgmtCommons.setHashGr(this.NEXT_RUN_HASH, this.jobNextRunDateHashTime.toString());
            } else {
                this.logStr += "\nReached maximum alerts to handle (" + this.MAX_ALERTS_TO_HANDLE +
                    "). Rest of the alerts will be handled in the next job run.";
            }
            this.slowStepManager.report();
            var totalDuration = GlideDateTime.subtract(startTime, new GlideDateTime());
            this.logStr += "\nTotal duration = " + totalDuration.getNumericValue() + " ms.";
            this.evtMgmtCommons.addDebugLogNoPrefix(this.logStr);

        } catch (e) {
            var error = this.evtMgmtCommons.getExceptionMessage(e, true);
            gs.error(this.type + " failed to run, exception thrown: \n" + error);
            if (this.slowStepManager) {
                this.slowStepManager.report();
            }
            this.evtMgmtCommons.addDebugLogNoPrefix(this.logStr);
        }
    },

    handleEmptyAlertSysIds: function() {
        this.slowStepManager.startStep('Handle danglig deleted alerts with empty sys ids');
        var startTime = new GlideDateTime();

        var allAlertsProcessed = true;

        var gr = new GlideRecord(this.ALERT_HIST_TABLE_NAME);
        gr.addNullQuery(this.ALERT_SYS_ID_COL);
        gr.addQuery(this.VT_END_COL, this.MAX_DATE);
        gr.addQuery(this.STATE_COL, '!=', this.CLOSED_STATE);
        gr.setLimit(this.MAX_ALERTS_TO_HANDLE);
        gr.query();

        var alertsCount = gr.getRowCount();
        if (alertsCount >= this.MAX_ALERTS_TO_HANDLE) {
            allAlertsProcessed = false;
        }

        while (gr.next()) {
            this.createClosedRecord(gr);
        }
        var alertsHandled = (alertsCount >= this.MAX_ALERTS_TO_HANDLE) ? this.MAX_ALERTS_TO_HANDLE : alertsCount;
        var processTime = GlideDateTime.subtract(startTime, new GlideDateTime());
        this.logStr += "\nhandleEmptyAlertSysIds - handled " + alertsHandled +
            " alerts. Processing time = " + processTime.getNumericValue() + " ms.";

        return allAlertsProcessed;
    },

    handleNonEmptyAlertSysIds: function() {
        this.slowStepManager.startStep('Handle danglig deleted alerts with non-empty sys ids');
        var allAlertsProcessed = true;
        var now = new GlideDateTime();
        now.subtract(this.CLEANUP_AGE_DAYS * 24 * 3600 * 1000);
        var startTime = new GlideDateTime();
        var lastHandledAlertNum = this.getLastHandledAlert();

        var gr = new GlideRecord(this.ALERT_HIST_TABLE_NAME);
        gr.addQuery(this.VT_START_COL, '<', now);
        gr.addQuery(this.VT_END_COL, this.MAX_DATE);
        gr.addQuery(this.STATE_COL, '!=', this.CLOSED_STATE);
        if (!gs.nil(lastHandledAlertNum)) {
            gr.addQuery(this.NUMBER_COL, '>', lastHandledAlertNum);
        }
        gr.addNotNullQuery(this.ALERT_SYS_ID_COL);
        gr.orderBy(this.NUMBER_COL);
        gr.setLimit(this.MAX_ALERTS_TO_HANDLE);
        gr.query();

        var alertsCount = gr.getRowCount();
        if (alertsCount >= this.MAX_ALERTS_TO_HANDLE) {
            allAlertsProcessed = false;
        }

        var alertsHandled = 0;
        while (gr.next()) {
            currAlertNum = gr.getValue(this.NUMBER_COL);
            if (this.isAlertDeleted(gr.getValue(this.ALERT_SYS_ID_COL))) {
                gr.setValue(this.ALERT_SYS_ID_COL, null); //clean alert sys id
                gr.update();
                this.createClosedRecord(gr);
                alertsHandled++;
            }
        }

        if (allAlertsProcessed) {
            this.setLastHandledAlertHash(''); //if all alerts were processed - reset the hash
        } else {
            this.setLastHandledAlertHash(currAlertNum);
        }
        var processTime = GlideDateTime.subtract(startTime, new GlideDateTime());
        this.logStr += "\nhandleNonEmptyAlertSysIds - handled " + alertsHandled +
            " alerts. Processing time = " + processTime.getNumericValue() + " ms.";

        return allAlertsProcessed;
    },

    createClosedRecord: function(source) {
        var closedRecord = new GlideRecord(this.ALERT_HIST_TABLE_NAME);
        closedRecord.initialize();
        for (var field in source) {
            if (this.IGNORED_COLUMNS.indexOf(field) == -1) {
                if (field == this.VT_START_COL || field == this.VT_END_COL) {
                    closedRecord.setValue(field, this.MAX_DATE);
                } else if (field == this.SYS_UPDATED_COL) {
                    closedRecord.setValue(field, new GlideDateTime());
                } else if (field == this.STATE_COL) {
                    closedRecord.setValue(field, this.CLOSED_STATE);
                } else if (field == this.OPEN_COL) {
                    closedRecord.setValue(field, 'false');
                } else {
                    closedRecord.setValue(field, source.getValue(field));
                }
            }
        }
        closedRecord.insert();
    },

    isAlertDeleted: function(alertSysId) {
        var alertGr = new GlideRecord('em_alert');
        alertGr.get(alertSysId);
        return (!alertGr.isValidRecord())
    },

    isTimeToRun: function() {
        this.slowStepManager.startStep('Check Hash');
        var res = true;
        var currTime = new GlideDateTime();

        var hashGr = this.evtMgmtCommons.getHashGr(this.NEXT_RUN_HASH);
        if ((hashGr.next())) {
            this.jobNextRunDateHashTime = new GlideDateTime(hashGr.getValue('hash'));
            if (this.jobNextRunDateHashTime > currTime) {
                this.evtMgmtCommons.addDebugLogNoPrefix(this.type + ":Current time is: " + String(currTime) + ". Returning without action, next job run is : " + String(this.jobNextRunDateHashTime));
                res = false;
            }
        } else {
            this.evtMgmtCommons.setHashGr(this.NEXT_RUN_HASH, currTime.toString());
        }

        return res;
    },

    getLastHandledAlert: function() {
        var lastHandledAlert = '';
        var hashGr = this.evtMgmtCommons.getHashGr(this.LAST_HANDLED_ALERT);
        if ((hashGr.next())) {
            lastHandledAlert = hashGr.getValue('hash');
        }
        return lastHandledAlert;
    },

    setLastHandledAlertHash: function(alertID) {
        this.evtMgmtCommons.setHashGr(this.LAST_HANDLED_ALERT, alertID);
    },

    getIntPropertyValue: function(propertyName, defaultVal) {
        var propertyValue = gs.getProperty(propertyName, defaultVal);
        var propertyIntVal = parseInt(propertyValue, 10);
        if (isNaN(propertyIntVal)) {
            return defaultVal;
        }
        return propertyIntVal;
    },


    type: 'EvtMgmtImpactSyncDeletedAlerts'
};
