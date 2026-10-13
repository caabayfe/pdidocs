(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("wf_workflow");
	if (!gr.get(current.workflow)){
		//On creating new workflow, it saved the ID of the version instead of the one of the workflow, so we try to update to the right one
		//Making sure it's a valid one
		var grVersion = new GlideRecord("wf_workflow_version");
		if (grVersion.get(current.workflow)){
			if (SNC.RemediationScriptableApi.getRemediationWorkflowQuery().includes(grVersion.workflow)) {	
				current.workflow = grVersion.workflow; 
			} else {
				current.workflow = "";
				current.active = false;
				gs.addErrorMessage(gs.getMessage("Deactivating action \"{0}\", adding non-supported remediation workflow is not allowed.",grVersion.workflow.name));	
			}		
		} else {
			current.workflow = "";
			current.active = false;
			gs.addErrorMessage(gs.getMessage("Deactivating action for which a match was not found."));	
		}
	}

})(current, previous);
