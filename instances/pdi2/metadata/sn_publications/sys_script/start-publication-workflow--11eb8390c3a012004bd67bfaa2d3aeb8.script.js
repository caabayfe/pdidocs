(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('sn_publications_workflow_config');
	if(gr.get('6c9b0e65c30112004bd67bfaa2d3ae56')){
		var workflowID = gr.getValue('workflow');
		var w = new global.Workflow();
		w.startFlow(workflowID, current, current.operation());
	}
	
})(current, previous);
