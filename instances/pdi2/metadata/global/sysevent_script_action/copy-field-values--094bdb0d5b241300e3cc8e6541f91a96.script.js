copyFieldValues("incident_alert", "source_incident", "source");
copyFieldValues("incident_alert_task", "incident_alert", "comm_plan");

function copyFieldValues(table, oldField, newField) {
	gs.info("copying field values from " + oldField + " to " + newField + " start");
	var gr = new GlideRecord(table);
	gr.addNullQuery(newField);
	gr.addNotNullQuery(oldField);
	gr.query();
	gr.setWorkflow(false);
	gr.setUseEngines(false);
	while (gr.next()) {
		gr.setValue(newField, gr.getValue(oldField));
		gr.update();
	}
	gs.info("copying field values from " + oldField + " to " + newField + " end");
}
