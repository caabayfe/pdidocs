
			(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_formula_function');
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('name', current.name);
	gr.addQuery('sys_scope', current.sys_scope);
	gr.queryNoDomain();
	
	if (gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Formula with the name '{0}' already exists in the current scope.", [current.name]));
	}
})(current, previous);
