var scriptToUpdateEvent = "gs.include('EvtMgmtAlertActions'); EvtMgmtAlertActions.runAlertActions();";
var scriptToUpdateConnectors = "gs.include('EvtMgmtUpdateStuckConnectors'); EvtMgmtUpdateStuckConnectors.updateStuckConnectors();";


var gr = new GlideRecord("sysauto_script");
if (gr.get("fdab0713eb1211004d7763fba206fefc")) { //event
	var script = gr.getValue("script");
	if (!script.contains("EvtMgmtAlertActions")) {
		gs.log("Updating script of 'Event Management - create/resolved incidents by alerts' job to work with script include");
		gr.setValue("script", scriptToUpdateEvent);
		gr.update();
	} else {
		gs.log("Script of 'Event Management  - create/resolved incidents by alerts' job is already updated to work with script include");
	}
}

gr = new GlideRecord("sysauto_script");
if (gr.get("8c86a0809352120056f8f179077ffb86")) { //connectors
	var script = gr.getValue("script");
	if (!script.contains("EvtMgmtUpdateStuckConnectors")) {
		gs.log("Updating script of 'Event Management  - Update stuck connectors' job to work with script include");
		gr.setValue("script", scriptToUpdateConnectors);
		gr.update();
	} else {
		gs.log("Script of 'Event Management  - Update stuck connectors' job is already updated to work with script include");
	}
}
