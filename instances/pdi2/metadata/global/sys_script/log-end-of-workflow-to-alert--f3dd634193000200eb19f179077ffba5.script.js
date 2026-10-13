function onAfter(current, previous) {
	if (!previous.closed_at && current.closed_at && (gs.getProperty('evt_mgmt.write_remediations_to_alert_work_notes', 'true') == 'true')) {
		var alertId = current.getValue("alert");
		var taskId = current.getValue("sys_id");
		var uri = "[code]" +  "<a href=\"" + "em_remediation_task.do?sys_id=" + taskId +  "\">"+ current.number +"</a>"+ "[/code]";
		
		var gr = new GlideRecord("em_alert");
		if (!gr.get(alertId))
			return;
		
		var end = current.getValue("closed_at");
		var alertManager = new SNC.AlertManager();
		alertManager.updateWorkNotesOnAlert(gr, gs.getMessage('Workflow {0} has finished running at {1}. For more details enter the task {2}',
		[current.remediation_workflow.name, end, uri]));
		gr.update();
	}
}
