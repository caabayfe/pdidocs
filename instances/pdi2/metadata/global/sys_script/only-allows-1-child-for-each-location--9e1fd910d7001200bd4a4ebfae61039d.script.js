(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_report_map_source');
	if (gr.get('parent', current.parent)) {
		gs.addErrorMessage(gs.getMessage('The parent map source you selected already has a child map source. Each map source can have only one child.'));
		current.setAbortAction(true);  
	}
	
})(current, previous);
