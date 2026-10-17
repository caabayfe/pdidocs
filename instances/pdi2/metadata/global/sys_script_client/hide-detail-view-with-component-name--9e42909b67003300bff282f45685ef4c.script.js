function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;

	var isWorkspace = g_form.getValue('ui_type') === 'workspace';
	var formEmptyDetailComponent = !g_form.getValue('detail_component_name');
	setDetailViewSectionDisplay(isWorkspace && formEmptyDetailComponent);
}

function setDetailViewSectionDisplay(show) {
	g_form.setDisplay('detail_title_field', show);
	g_form.setMandatory('detail_title_field', show);
	g_form.setDisplay('detail_link_field', show);
	g_form.setDisplay('detail_additional_fields', show);
	g_form.setDisplay('detail_display_work_note', show);
	g_form.setSectionDisplay('detail_view', show);
}
