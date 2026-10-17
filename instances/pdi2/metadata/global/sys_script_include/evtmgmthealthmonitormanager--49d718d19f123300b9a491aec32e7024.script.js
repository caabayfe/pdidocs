var EvtMgmtHealthMonitorManager = Class.create();
EvtMgmtHealthMonitorManager.prototype = {
	
	//Please note, this script is used from HLA script HLASelfHealthManager
	
    initialize: function() {

        this.generator = new EvtMgmtEventAlertGenerator();
        this.common = new EvtMgmtHealthMonitorCommon();
        this.handler = new EvtMgmtHealthMonitorHandler();
    },

    /*
	* msgKey - key of the table, will be redirect to the message_key field of the Event/Alert
	* severity - soulb be the number of the severity
	* description - description of the problem
	* aditionaInfo - JSON of the Event/Alert additional info
	* metricName - the Metric Name field
	* resource - the resource field
	* bindedCIName - the binded application. the application is on cmdb_ci_appl_now_app table. and the internal_name field should be match to this field.
	* isKeepOpen - flag to check if there is need to clean the alert
	* expirationPeriodInSec - expiration period of this record. there is cleaner should be removed those records
	* updateTimeInSec - period how much time there is need to wait until fire another event to the em_event table
	*/
	sendEvent: function(msgKey, severity, description, aditionaInfo, metricName, resource, bindedCIName, isKeepOpen, expirationPeriodInSec, updateTimeInSec) {

        if (this.common.selfHealthActive()) {
            var gr = this.handler.getRecordByKey(msgKey);
            var eventSysID = null;
            if (gr) {
                if (this.handler.canFireMonitoringEvent(gr)) {
                    this.generator.setExplicitBindedName(bindedCIName);
                    eventSysID = this.generator.openEvent(msgKey, severity, description, aditionaInfo, null, null, metricName, resource, null);
                    this.handler.update(gr, isKeepOpen, description, expirationPeriodInSec, updateTimeInSec, null, eventSysID);
                } else {
                    this.handler.update(gr, isKeepOpen, description, expirationPeriodInSec, 0, null, null);
                }
            } else {
                this.generator.setExplicitBindedName(bindedCIName);
                eventSysID = this.generator.openEvent(msgKey, severity, description, aditionaInfo, null, null, metricName, resource, null);
                this.handler.insert(msgKey, null, eventSysID, description, isKeepOpen, expirationPeriodInSec, updateTimeInSec);

            }
        }
    },

    
	/*
	* msgKey - key of the table, will be redirect to the message_key field of the Event/Alert
	* severity - soulb be the number of the severity
	* description - description of the problem
	* aditionaInfo - JSON of the Event/Alert additional info
	* metricName - the Metric Name field
	* resource - the resource field
	* workNote - work notes of the alert
	* bindedCIName - the binded application. the application is on cmdb_ci_appl_now_app table. and the internal_name field should be match to this field.
	* isKeepOpen - flag to check if there is need to clean the alert
	* expirationPeriodInSec - expiration period of this record. there is cleaner should be removed those records
	* updateTimeInSec - period how much time there is need to wait until fire another event to the em_event table
	*/
	sendAlert: function(msgKey, severity, description, aditionaInfo, metricName, resource, workNote, bindedCIName, isKeepOpen, expirationPeriodInSec, updateTimeInSec) {

        if (this.common.selfHealthActive()) {
            var gr = this.handler.getRecordByKey(msgKey);
            var alertSysID = null;
            if (gr) {
                if (this.handler.canFireMonitoringEvent(gr)) {
                    this.generator.setExplicitBindedName(bindedCIName);
                    alertSysID = this.generator.openAlert(msgKey, severity, description, aditionaInfo, null, null, metricName, resource, null, workNote);
                    this.handler.update(gr, isKeepOpen, description, expirationPeriodInSec, updateTimeInSec, alertSysID, null);
                } else {
                    this.handler.update(gr, isKeepOpen, description, expirationPeriodInSec, 0, null, null);
                }
            } else {
                this.generator.setExplicitBindedName(bindedCIName);
                alertSysID = this.generator.openAlert(msgKey, severity, description, aditionaInfo, null, null, metricName, resource, null,workNote);
                this.handler.insert(msgKey, alertSysID, null, description, isKeepOpen, expirationPeriodInSec, updateTimeInSec);
            }
			return alertSysID;
        }
    },

    /*
	* msgKey - key of the table, will be redirect to the message_key field of the Event/Alert
	* severity - soulb be the number of the severity
	* description - description of the problem
	* aditionaInfo - JSON of the Event/Alert additional info
	* metricName - the Metric Name field
	* resource - the resource field
	*/
	closeEvent: function(msgKey, severity, description, aditionaInfo, metricName, resource) {
        if (this.common.selfHealthActive()) {
            var gr = this.handler.getRecordByKey(msgKey);
            if (gr) {
                if (this.handler.canFireClosingEvent(gr)) {
                    this.handler.closeRecord(gr);
                    this.generator.closeEvent(msgKey, severity, description, aditionaInfo, null, null, metricName, resource, null);
                }
            } 
        }
    },

     /*
	* msgKey - key of the table, will be redirect to the message_key field of the Event/Alert
	* workNote - work notes of the alert
	*/
	closeAlert: function(msgKey, workNote) {
		var retVal = null;
        if (this.common.selfHealthActive()) {
            if (this.common.allowHealthToRun()) {
                var gr = this.handler.getRecordByKey(msgKey);
                if (gr) {
                    if (this.handler.canFireClosingEvent(gr)) {
                        this.handler.closeRecord(gr);
                        retVal = this.generator.closeAlert(msgKey, workNote, null, null);
                    }
                } 
            }
        }
		return retVal;
    },

    type: 'EvtMgmtHealthMonitorManager'
};
