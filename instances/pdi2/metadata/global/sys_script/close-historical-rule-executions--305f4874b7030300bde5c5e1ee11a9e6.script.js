(function executeRule(current, previous /*null when async*/) {

	var alertManager = new SNC.AlertManager();
	alertManager.addStep("Alert BR: Close historical rule executions (after)");
	
	var gr = new GlideRecord("em_alert_management_execution");
	gr.addQuery("alert",current.getUniqueValue());
	gr.addQuery("historical", "!=", "true");
	gr.setValue("historical","true");
	gr.updateMultiple();

})(current, previous);
