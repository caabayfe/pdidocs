(function executeRule(current, previous /*null when async*/) {

	var flowId = current.flow;
	var flow = new GlideRecord('sys_hub_flow');
	
	if (flow.get(flowId)) { //flow exists
		
		var anotherTemplateReferencingThisFlow = new GlideRecord('sys_app_template');
		anotherTemplateReferencingThisFlow.addQuery('sys_id', '!=', current.sys_id); //another template
		anotherTemplateReferencingThisFlow.addQuery('flow', flowId); //referencing this flow
		anotherTemplateReferencingThisFlow.query();
		
		if (!anotherTemplateReferencingThisFlow.next()) { //if there isn't another template referencing this flow
			
			flow.deleteRecord();
		}
	}

})(current, previous);
