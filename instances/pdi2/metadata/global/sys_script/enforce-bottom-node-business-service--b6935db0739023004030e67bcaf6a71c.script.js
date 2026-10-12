(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('spm_taxonomy_node');
	gr.addQuery('parent', current.spm_taxonomy_node);
	gr.query();
	
	if (gr.next()){
		gs.addErrorMessage(gs.getMessage('Services can only be created in the bottom most node'));
		current.setAbortAction(true);
	}

})(current, previous);
