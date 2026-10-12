(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_hub_category');
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('name', current.name);
	gr.addQuery('sys_scope', current.sys_scope);
	gr.query();
	
	if (gr.next()) {
		var errMsg = gs.getMessage("An action category with the name '{0}' has already been created in the current scope.", current.name);
		current.setAbortAction(true);
		gs.addErrorMessage(errMsg);
	}
})(current, previous);
