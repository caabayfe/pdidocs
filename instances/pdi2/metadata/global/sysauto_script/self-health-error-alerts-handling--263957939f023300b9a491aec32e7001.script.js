var SLEF_HEALTH_TABLE = 'em_self_health_error_handling';

function closeExpiredAlerts() {
    var gr = new GlideRecord(SLEF_HEALTH_TABLE);
    var currentTime = new GlideDateTime();
    gr.addQuery('expiration_time', "<", currentTime);
    gr.addQuery('keep_alert_open', 'false');
    gr.query();

    var alertSysID = '';
    while (gr.next()) {
        var eventID = gr.getValue('event');
        if (JSUtil.notNil(eventID)) {
            var eventGR = new GlideRecord('em_event');
            eventGR.addQuery('sys_id', eventID);
            eventGR.query();
            if (eventGR.next()) {
                alertSysID = eventGR.getValue('alert');
            }
        } else {
            alertSysID = gr.getValue('alert');
        }

        var selfHelthGr = new GlideRecord(SLEF_HEALTH_TABLE);
        selfHelthGr.addQuery('key', gr.getValue('key'));
		selfHelthGr.addQuery('expiration_time', ">", currentTime).addOrCondition('keep_alert_open','true');
        selfHelthGr.query();

        if (!selfHelthGr.next()) {

            if (JSUtil.notNil(alertSysID)) {
                var alertGr = new GlideRecord('em_alert');
                alertGr.addQuery('sys_id', alertSysID);
                alertGr.addQuery('state', '!=', 'Closed');
                alertGr.query();
                if (alertGr.next()) {
                    alertGr.setValue('state', 'Closed');
                    var alertManager = new SNC.AlertManager();
                    alertManager.updateWorkNotesOnAlert(alertGr, "Alert Closed Because Expiration time Period");
                    alertGr.update();
                }
            }
        }
        gr.deleteRecord();
    }
}

closeExpiredAlerts();
