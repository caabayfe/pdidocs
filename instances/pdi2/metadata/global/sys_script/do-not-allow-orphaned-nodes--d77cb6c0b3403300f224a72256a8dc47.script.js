(function executeRule(current, previous /*null when async*/) {
	
	var gr = new GlideRecord('spm_taxonomy_node');
	gr.addQuery('parent', previous.getValue('sys_id'));
	gr.query();
	
	if (gr.next()){
		gs.addErrorMessage(gs.getMessage('This node is parent to another taxonomy node. You cannot delete this node without first deleting the associated child node'));
		current.setAbortAction(true);
	}

})(current, previous);
