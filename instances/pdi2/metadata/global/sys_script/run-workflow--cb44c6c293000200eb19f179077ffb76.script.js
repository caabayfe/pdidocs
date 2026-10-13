function onAfter(current, previous) {
	current.setValue("run_remediation", true);
	current.update();
	
	if (gs.getProperty('evt_mgmt.write_remediations_to_alert_work_notes', 'true') == 'true') {
		var gr = new GlideRecord("em_alert");
		if (!gr.get(current.alert))
			return;
		
		var grContext = new GlideRecord("wf_context");
		grContext.addQuery("id", current.sys_id);
		grContext.query();
		if (!grContext.next())
			return;
		
		var uriTask = "[code]" +  "<a href=\"" + "em_remediation_task.do?sys_id=" + current.sys_id +  "\">"+ current.number +"</a>"+ "[/code]";
		var uriFlow = "[code]" +  "<a href=\"" + "context_workflow.do?sysparm_sys_id=" + grContext.getValue("sys_id") +  "\">"+ current.remediation_workflow.name +"</a>"+ "[/code]";
		
		var time = current.getValue("sys_created_on");
		
		var alertManager = new SNC.AlertManager();
		alertManager.updateWorkNotesOnAlert(gr, gs.getMessage('Workflow {0} has started running at {1}. For more details enter the task {2} or the {3} status',
			[current.remediation_workflow.name, time, uriTask, uriFlow]));
			
		gr.update();
	}
}
