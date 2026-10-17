function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;

	var isWorkspace = newValue === 'workspace';
	var dbEmptyDetailComponent = g_scratchpad.emptyDetailComponent;
	var formHasDetailComponentField = g_form.hasField('detail_component_name');
	var formEmptyDetailComponent = !g_form.getValue('detail_component_name');

	g_form.setDisplay('detail_component_name', isWorkspace);
	if (!isWorkspace)
		g_form.clearValue('detail_component_name');
	setDetailViewSectionDisplay(isWorkspace && ((formHasDetailComponentField && formEmptyDetailComponent) || (!formHasDetailComponentField && dbEmptyDetailComponent)));
}

function setDetailViewSectionDisplay(show) {
	g_form.setDisplay('detail_title_field', show);
	g_form.setMandatory('detail_title_field', show);
	g_form.setDisplay('detail_link_field', show);
	g_form.setDisplay('detail_additional_fields', show);
	g_form.setDisplay('detail_display_work_note', show);
	g_form.setSectionDisplay('detail_view', show);
}
