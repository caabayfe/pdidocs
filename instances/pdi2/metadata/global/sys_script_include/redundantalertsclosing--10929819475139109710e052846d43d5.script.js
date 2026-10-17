gs.include('EvtMgmtCommons');

var RedundantAlertsClosing = Class.create();
RedundantAlertsClosing.prototype = {
    initialize: function() {
        this.timeRangeToRun = this.getTime();
        this.worknotes = gs.getProperty("evt_mgmt.close_duplicate_alerts_add_to_worknote", 'true');
        this.evtMgmtCommons = new global.EvtMgmtCommons();
    },

    handleRedundantAlert: function() {
        var closeDuplicateAlertsProp = gs.getProperty("evt_mgmt.close_duplicate_alerts", false);
        if (closeDuplicateAlertsProp == 'true') {
            this.closeDuplicateAlerts();
            this.closeEmptyGroupAlerts();
        }
    },


    closeEmptyGroupAlerts: function() {
        //we will run on all new alerts that were opened in the last defined by property time.
        //foreach grouped alert we will check if it has events connected to it.
        //if not - we will close the grouped alert and update the worknote (depends on property)

        this.evtMgmtCommons.addDebugMessage("Running close empty alerts");

        var ga = new GlideRecord('em_alert');
        ga.addQuery('sys_created_on', '>=', this.timeRangeToRun);
        ga.addQuery('state', '!=', 'Closed');
        ga.addQuery('correlation_group', 0);
        ga.addQuery('description', 'STARTSWITH', 'Group of alerts');
        ga.addQuery('source', 'Log Analytics');
        ga.orderBy('sys_created_on');
        ga.query();

        while (ga.next()) {
            this.closeAlert(ga, gs.getMessage('Closing this group alert since it has no secondries alert. Probably were removed by event rule'));
        }
    },

    closeDuplicateAlerts: function() {
        //we will run on all new alerts that were opened in the last defined by property time.
        //foreach alert we will check if there are old alerts with this msg_key
        //we will keep the severity of the latest one and close it(worknotes depends on property)
        //we will update the events of the alerts that were closed with the kept alert number

        var ga = new GlideRecord('em_alert');
        ga.addQuery('sys_created_on', '>=', this.timeRangeToRun);
        ga.addQuery('state', '!=', 'Closed');
        ga.orderBy('sys_created_on');
        ga.query();

        while (ga.next()) {
            this.checkForDuplicateMsgKey(ga);
        }
    },

    checkForDuplicateMsgKey: function(newAlertGr) {
        //we want to check if the new alert's msg_key already exist in em_alert table
        //we need to run two queries in order to figure out if the duplication is whitin the time range or earlier
        //if an early one exist - we will take the most updated one
        //if an early one does not exist we will check if whithin the time range there is a duplication and take the oldest one
        // if so we will close the new one and update the old one with the new one's severity

        var msgKey = newAlertGr.getValue('message_key');
        var latestSeverity = newAlertGr.getValue('severity');
        var closedAlertSysId = newAlertGr.getValue('sys_id');

        //we will query only the alets in the time-range prior to the timeRangeToRun
        //currently ignoring duplicate alerts that arrived whithin the timeRangeToRun
        //we do not need to filter the alert which is checked from the query since the range does not congruent
        var gr1 = new GlideRecord('em_alert');
        gr1.addQuery('sys_created_on', '<', this.timeRangeToRun);
        gr1.addQuery('state', '!=', 'Closed');
        gr1.addQuery('message_key', msgKey);
        gr1.orderByDesc('sys_updated_on'); // we will keep the newset from existing alerts
        gr1.setLimit(1);
        gr1.query();

        this.evtMgmtCommons.addDebugMessage("Running close duplicate alerts - found: " + gr1.getRowCount() + " duplicate alerts to be closed");

        if (gr1.next()) {
            var alertNumber = gr1.getValue('number');
            var severity = gr1.getValue('severity');
            var openedAlertSysId = gr1.getValue('sys_id');
            if (severity != latestSeverity) {
                gr1.setValue('severity', latestSeverity);
                if (this.worknotes) {
                    this.addWorknotesToAlert(gr1, gs.getMessage('The severity was changed to {0}, due to alert duplication removal (keeping the new severity)', latestSeverity));
                }
                openedAlertSysId = gr1.update();
            }

            this.closeAlert(newAlertGr, gs.getMessage('This alert was closed due to duplication. Remained alert is: {0}', alertNumber));
            this.updateEvent(closedAlertSysId, openedAlertSysId);
        }
    },

    closeAlert: function(closeGr, msg) {
        //we want to close the alert (and add a note to its worknotes if property is true)
        closeGr.setValue('state', 'Closed');
        this.evtMgmtCommons.addDebugMessage("Running close duplicate alerts - close alert:" + closeGr.getValue('sys_id'));

        if (this.worknotes)
            this.addWorknotesToAlert(closeGr, msg);
        closeGr.update();
    },

    updateEvent: function(closedAlertSysId, openedAlertSysId) {
        //we need to update the event as well with the left alert number
        var eventsGr = new GlideRecord('em_event');
        var eq = 'sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()';
        eventsGr.addEncodedQuery(eq);
        eventsGr.addQuery('alert', closedAlertSysId);
        eventsGr.query();
        while (eventsGr.next()) {
            this.evtMgmtCommons.addDebugMessage("Running close duplicate alerts - update event:" + eventsGr.getValue('sys_id') + " with alert:" + openedAlertSysId);

            eventsGr.setValue('alert', openedAlertSysId);
            eventsGr.update();
        }
    },

    addWorknotesToAlert: function(alert, msg) {
        var alertManager = new SNC.AlertManager();
        alertManager.updateWorkNotesOnAlert(alert, msg);
    },

    getTime: function() {
        var timeRangeInSec = gs.getProperty("evt_mgmt.close_duplicate_alerts_in_timeframe_sec", '60');
        var gdt = new GlideDateTime();
        var milliseconds = timeRangeInSec * 1000;
        gdt.subtract(milliseconds);
        return gdt;
    },

    type: 'RedundantAlertsClosing'
};
