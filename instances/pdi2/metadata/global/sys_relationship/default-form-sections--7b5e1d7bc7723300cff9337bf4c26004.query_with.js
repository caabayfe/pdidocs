(function refineQuery(current, parent) {
	current.addQuery('view_rule', parent.getUniqueValue());
	current.addQuery('form_section.sys_ui_form.name', parent.table);
	current.addQuery('form_section.sys_ui_form.view', parent.view);
	current.orderBy('order');
	current.orderBy('form_section.position');
})(current, parent);
