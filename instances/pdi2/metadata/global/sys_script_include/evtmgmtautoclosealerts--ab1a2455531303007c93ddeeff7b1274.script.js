var EvtMgmtAutoCloseAlerts = Class.create();
EvtMgmtAutoCloseAlerts.prototype = {
	initialize: function() {
	},
	
	type: 'EvtMgmtAutoCloseAlerts'
};

EvtMgmtAutoCloseAlerts.autoCloseAlerts = function() {
	var TIME_THRESHOLD_PASSED = "Time threshold passed";

	var writeToPerfTable = function(count, duration) {
		var gr = new GlideRecord("sa_performance_statistics");
		gr.setValue("type", "closeAlertsJob");
		gr.setValue("count", count);
		gr.setValue("duration", duration);
		gr.insert();
   };
	
	var sw = new GlideStopWatch();
	var alertManager = new SNC.AlertManager();
	alertManager.setStepTopic("Close Alert Job");
	var CLOSE_INTERVAL = GlideProperties.get('evt_mgmt.alert_auto_close_interval', 168);
	if (parseInt(CLOSE_INTERVAL) > 0){
		var alertGr = new GlideRecord("em_alert");
		alertGr.addQuery("state","IN","Open,Reopen,Flapping");
		var now = new GlideDateTime();
		now.addSeconds(CLOSE_INTERVAL*3600 * -1); //1 hour = 3600 seconds
		alertGr.addQuery("sys_updated_on","<=",now);
		alertManager.addStep("Query close alerts");
		alertGr.query();
		var alertsCount = alertGr.getRowCount();
		while(alertGr.next()){
			alertGr.setValue("state","Closed");
			alertManager.addStep("Update worknotes on alert");
			alertManager.updateWorkNotesOnAlert(alertGr, gs.getMessage("Alert is automatically closed when it is idle for more than {0} hours.", [CLOSE_INTERVAL]));
			alertManager.addStep("Alert Update");
			alertManager.setClosureReason(TIME_THRESHOLD_PASSED);
			alertGr.update();
			alertManager.addStep("Get Next alert");
		}
		alertManager.stepReport();
		var duration = sw.getTime();
		if(duration > 5000) // Write statistics only if the query took more then 5 seconds
			writeToPerfTable(alertsCount, sw.getTime());
	}
};
