function onLoad() {
	var isWorkspace = g_form.getValue('ui_type') === 'workspace';
	var dbEmptyDetailComponent = g_scratchpad.emptyDetailComponent;
	g_form.setDisplay('detail_component_name', isWorkspace);
	g_form.setDisplay('detail_component_parameters', isWorkspace);
	if (!isWorkspace)
		g_form.clearValue('detail_component_name');
	setDetailViewSectionDisplay(isWorkspace && dbEmptyDetailComponent);
}

function setDetailViewSectionDisplay(show) {
	g_form.setDisplay('detail_title_field', show);
	g_form.setMandatory('detail_title_field', show);
	g_form.setDisplay('detail_link_field', show);
	g_form.setDisplay('detail_additional_fields', show);
	g_form.setDisplay('detail_display_work_note', show);
	g_form.setSectionDisplay('detail_view', show);
}
