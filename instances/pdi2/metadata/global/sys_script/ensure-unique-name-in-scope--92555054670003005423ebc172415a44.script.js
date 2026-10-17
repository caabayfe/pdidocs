(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_hub_action_type_definition');
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('internal_name', current.internal_name);
	gr.addQuery('sys_scope', current.sys_scope);
	gr.queryNoDomain();
	
	if (gr.next()) {
		var errMsg = gs.getMessage("An action with the internal name '{0}' has already been created in the current scope.", current.internal_name);
		current.setAbortAction(true);
		gs.addErrorMessage(errMsg);
	}
})(current, previous);
