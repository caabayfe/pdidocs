changeImpactedServiceLabel();
calcPriority();

function calcPriority(){
	var currentDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("Starting 'Event Management - calculate priority' fix script. Start Time: " + currentDateTime);
	var gr = new GlideRecord("em_alert");
	gr.addNotNullQuery("sn_priority");
	gr.query();
	if (gr.next()) {
		gs.log("Existing 'Event Management - calculate priority' fix script. Should not run more than once");
	} else {
		var alertManager = new SNC.AlertManager();
		var alerts = alertManager.enqueueAllOpenAlerts();

		var endDateTime = new GlideDateTime(gs.nowNoTZ());
		var timeDifference = GlideDateTime.subtract(currentDateTime, endDateTime).getDurationValue();
		gs.log("Done calculating priority for all open alerts, total of " + alerts + " alerts. End Time: " + endDateTime + ", Total execution Time: " + timeDifference);
	}
}

function changeImpactedServiceLabel(){
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('element','impact_services');
	gr.query();
	if(gr.next()){
		gr.setValue('column_label', gs.getMessage('Impacted Services (Old)'));
		gr.update();
		gs.log('Label of Impacted service colunm in em_alert was changed');
	}
}
