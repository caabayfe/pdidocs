(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('cmdb_ci_service');
	gr.addQuery('spm_taxonomy_node', current.parent.sys_id);
	gr.query();
		if (gr.next()){
		gs.addErrorMessage(gs.getMessage('Error, services may only be related to the leaf nodes of the portfolio. In order to add a new leaf node, you must first reparent the services.'));
		current.setAbortAction(true);
		return;
	}
  	if (current.parent.sys_id == current.sys_id) {
			gs.addErrorMessage(gs.getMessage("Error: This node cannot be added as its parent. You must choose a different node."));
			current.setAbortAction(true);
			return;
	}

})(current, previous);
