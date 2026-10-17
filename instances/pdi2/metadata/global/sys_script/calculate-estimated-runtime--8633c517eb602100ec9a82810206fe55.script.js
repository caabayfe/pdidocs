
function onBefore(current, previous) {
   //This function will be automatically called when this rule is processed.
	current.running_duration = gs.dateDiff(current.started.getDisplayValue(), current.ended.getDisplayValue(), false);		
    var grConfig = new GlideRecord('wf_estimated_runtime_config');
    grConfig.addQuery('workflow_version', current.workflow_version);
    grConfig.query();
	
    while (grConfig.next()) {
	    var wf = new Workflow();				
	    wf.calculateEstimatedRuntime(grConfig, current);
    }		
   
}
