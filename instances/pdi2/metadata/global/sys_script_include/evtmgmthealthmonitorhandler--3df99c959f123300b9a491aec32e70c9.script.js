var EvtMgmtHealthMonitorHandler = Class.create();
EvtMgmtHealthMonitorHandler.prototype = {
    initialize: function() {
        this.SELF_HEALTH_HANDLING_TABLE = "em_self_health_error_handling";
    },

    getRecordByKey: function(key) {
        var gr = new GlideRecord(this.SELF_HEALTH_HANDLING_TABLE);
        if (!key) {
            return;
        }
        gr.addQuery('key', key);

        var currentTime = new GlideDateTime();
        gr.addQuery('expiration_time', '>=', currentTime).addOrCondition('keep_alert_open','true');

        gr.query();
        if (gr.next()) {
            return gr;
        }

        return null;

    },

    canFireMonitoringEvent: function(gr) {
        var updateTime = gr.getValue('update_time');
        var currentTime = new GlideDateTime();
        var recordTime = new GlideDateTime(updateTime);
        if (currentTime.after(recordTime) || currentTime.equals(recordTime)) {
            return true;
        }
        return false;
    },

    canFireClosingEvent: function(gr) {
        var state = gr.getValue('state');
        if (state == '1') {
            return true;
        }
        return false;
    },
	
	closeRecord : function(gr) {
		gr.setValue('state','2');
		var currentTime = new GlideDateTime();
		gr.setValue('expiration_time',currentTime);
		gr.setValue('keep_alert_open', 'false');
		gr.update();
	},

    update: function(gr, keepAlertOpen, description, expirationPeriodInSec, timeUpdatePeriod, alertSysID, eventSysID) {
        var big = expirationPeriodInSec > 0 && !keepAlertOpen;
        gs.error(keepAlertOpen);
        if (expirationPeriodInSec > 0 && !keepAlertOpen) {
            var expTime = new GlideDateTime();
            expTime.addSeconds(expirationPeriodInSec);
            gr.setValue('expiration_time', expTime.getValue());
        }

        if (timeUpdatePeriod > 0) {
            if (this.canFireMonitoringEvent(gr)) {
                var currentTime = new GlideDateTime();
                currentTime.addSeconds(timeUpdatePeriod);
                gr.setValue('update_time', currentTime.getValue());
            }
        }

        gr.setValue('keep_alert_open', expirationPeriodInSec <= 0 ? 'true' : keepAlertOpen);
        gr.setValue('description', description);
        gr.setValue('state', '1');

        if (eventSysID) {
            gr.setValue('event', eventSysID);
        }
        if (alertSysID) {
            gr.setValue('alert', alertSysID);
        }
        if (description) {
            gr.setValue('description', description);
        }

        gr.update();
    },

    insert: function(key, alertSysID, eventSysID, description, isKeepAlertOpen, expirationPeriodInSec, timeUpdatePeriod) {

        var gr = new GlideRecord(this.SELF_HEALTH_HANDLING_TABLE);
        gr.setValue('key', key);
        gr.setValue('state', '1');

        if (eventSysID) {
            gr.setValue('event', eventSysID);
        }
        if (alertSysID) {
            gr.setValue('alert', alertSysID);
        }
        if (description) {
            gr.setValue('description', description);
        }

        gr.setValue('keep_alert_open', expirationPeriodInSec <= 0 ? 'true' : isKeepAlertOpen);

        if (expirationPeriodInSec > 0 && !isKeepAlertOpen) {
            var expTime = new GlideDateTime();
            expTime.addSeconds(expirationPeriodInSec);
            gr.setValue('expiration_time', expTime.getValue());
        }

        if (timeUpdatePeriod > 0) {
            if (this.canFireMonitoringEvent(gr)) {
                var currentTime = new GlideDateTime();
                currentTime.addSeconds(timeUpdatePeriod);
                gr.setValue('update_time', currentTime.getValue());
            }
        }

        gr.insert();
    },

    type: 'EvtMgmtHealthMonitorHandler'
};
