(function() {
	var defaultSLAWorkflowID = "4b6570360a0a0b3000bbacab877713f2";
	
	var wfWorkflowGr = new GlideRecord("wf_workflow");
	if (!wfWorkflowGr.get(defaultSLAWorkflowID)) {
		gs.warn("Fix job \"All scope access to Default SLA workflow\" failed to find the workflow record");
		return;
	}
	
	wfWorkflowGr.setValue("access", "public");
	if (wfWorkflowGr.update())
		gs.log("Fix job \"All scope access to Default SLA workflow\" updated workflow \"" +
			   wfWorkflowGr.getDisplayValue() + "\" to be accessible from all scopes");
	else
		gs.warn("Fix job \"All scope access to Default SLA workflow\" failed to update workflow \"" +
			    wfWorkflowGr.getDisplayValue() + "\" so that it is accessible from all scopes");
})();
