(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_ui_form_section');
	gr.addQuery('sys_id', current.form_section);
	gr.addQuery('sys_ui_form.name', current.view_rule.table);
	gr.addQuery('sys_ui_form.view', current.view_rule.view);
	gr.query();
	if (!gr.next())
		g_scratchpad.form_section_error = gs.getMessage('Invalid Reference');
})(current, previous);
