(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('dp_app_profile_template_has_dc');
	gr.addQuery('template', current.template);
	gr.addQuery('data_class', current.data_class);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage(`Record with Template '${gr.template.getDisplayValue()}' and Data Class '${gr.data_class.getDisplayValue()}' already exists`));
		current.setAbortAction(true);
	}
	
})(current, previous);
