var EvtMgmtFixAlertHistoryBackfill = Class.create();
EvtMgmtFixAlertHistoryBackfill.prototype = {
    initialize: function() {
        this.LAST_SYNC_ALERT_HISTORY = "last_sync_alert_history";
        this.evtMgmtCommons = new global.EvtMgmtCommons();
        this.DESCRIPTION_COL = "description";
        this.ALERT_SYS_ID_COL = "alert_sys_id";
        this.SYS_ID_COL = "sys_id";
        this.SYS_CREATED_COL = "sys_created_on";
        this.VT_END_COL = "vt_end";
        this.ALERT_TABLE = "em_alert";
        this.ALERT_HIST_TABLE = "em_alert_history";
        this.MAX_CREATED = new GlideDateTime();
        this.DELAY = 180000; //3 minites
        this.FUTURE_DATE = "2030-04-19 14:12:38"
    },

    process: function() {
        if (gs.getProperty('evt_mgmt.fix_alert_history_backfill', "false") == "false") {
            return;
        }
        this.MAX_CREATED.subtract(this.DELAY);

        var alerts = this.findProblematicRecords();
        this.evtMgmtCommons.setHashGr(this.LAST_SYNC_ALERT_HISTORY, this.MAX_CREATED.toString());

        if (gs.nil(alerts) || alerts.length == 0) {
            return;
        }
        //add a blank to the end of the description field to create alert update and to force backfill 
        var gr = new GlideRecord(this.ALERT_TABLE);
        gr.addQuery(this.SYS_ID_COL, 'IN', alerts);
        gr.query();
        while (gr.next()) {
            var descrValue = gr.getValue(this.DESCRIPTION_COL);
            if (gs.nil(descrValue)) {
                descrValue = ' ';
            }
            gr.setValue(this.DESCRIPTION_COL, descrValue + ' ');
            gr.update();
        }
    },

    getNewlyUpdatedAlerts: function() {
        var alerts = [];
        //using GlideAggregate to get unique values
        var ga = new GlideAggregate(this.ALERT_HIST_TABLE);
        var startTime = this.getStartTime();
        ga.addQuery(this.SYS_CREATED_COL, '>=', startTime);
        ga.addQuery(this.SYS_CREATED_COL, '<', this.MAX_CREATED);
        ga.groupBy(this.ALERT_SYS_ID_COL);
        ga.query();
        while (ga.next()) {
            alerts.push(ga.getValue(this.ALERT_SYS_ID_COL));
        }
        this.evtMgmtCommons.addDebugLogNoPrefix("EvtMgmtFixAlertHistoryBackfill: found " + alerts.length + " newly updated alerts between " + startTime.toString() + " to " + this.MAX_CREATED.toString());

        return alerts;
    },

    //find alerts for which there is more than 1 record with vt_end == MAX_INT
    findProblematicRecords: function() {
        var newlyUpdated = this.getNewlyUpdatedAlerts();
        var problematicAlerts = [];

        var i = 0;
        for (i = 0; i < newlyUpdated.length; i++) {
            var ga = new GlideAggregate(this.ALERT_HIST_TABLE);
            ga.addAggregate('COUNT', this.ALERT_SYS_ID_COL);
            ga.addQuery(this.ALERT_SYS_ID_COL, newlyUpdated[i]);
            ga.addQuery(this.VT_END_COL, ">", this.FUTURE_DATE);
            ga.addHaving('COUNT', '>', 1);
            ga.query();

            if (ga.next()) {
                var count = ga.getAggregate('COUNT', this.ALERT_SYS_ID_COL);

                gs.info("EvtMgmtFixAlertHistoryBackfill: Alert history backfill problem - Alert " + ga.getDisplayValue(this.ALERT_SYS_ID_COL) + " had " + count + " records with vt_end == MAX_INT, the problem was fixed");

                problematicAlerts.push(ga.getValue(this.ALERT_SYS_ID_COL));
            } else {
                this.evtMgmtCommons.addDebugLogNoPrefix("EvtMgmtFixAlertHistoryBackfill: no problematic alert history records were found for the alert with sysId " + newlyUpdated[i]);
            }
        }

        return problematicAlerts;
    },

    getStartTime: function() {
        var backFillHours = this.getIntPropertyValue('evt_mgmt.fix_alert_history_backfill_hours', 2);
        var startTime = new GlideDateTime();
        startTime.subtract(backFillHours * 3600 * 1000);

        var hashGr = this.evtMgmtCommons.getHashGr(this.LAST_SYNC_ALERT_HISTORY);
        if ((hashGr.next())) {
            syncHashTime = new GlideDateTime(hashGr.getValue('hash'));
            var timeStampSec = gs.dateDiff(syncHashTime, new GlideDateTime(), true);

            if (timeStampSec < backFillHours * 3600) {
                startTime = syncHashTime;
            }
        }
        return startTime;
    },

    getIntPropertyValue: function(propertyName, defaultVal) {
        var propertyValue = gs.getProperty(propertyName, defaultVal);
        var propertyIntVal = parseInt(propertyValue, 10);
        if (isNaN(propertyIntVal)) {
            return defaultVal;
        }
        return propertyIntVal;
    },


    type: 'EvtMgmtFixAlertHistoryBackfill'
};
