function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (newValue == "ui_action") {
		g_form.setDisplay('ui_action', true);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		
	} else if (newValue == "tab_section") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		
	} else if (newValue == "tab_section_tab_only") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		
	} else if (newValue == "filters") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', true);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	}
	
	else if (newValue == "field_header") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', true);
		g_form.setDisplay('field_header', true);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	}
	
	else if (newValue == "list_header") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', true);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	}
	
	else if (newValue == "cell_types") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', true);
		g_form.setDisplay('cell_edit', false);
	}
	
	else if (newValue == "cell_edit") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', true);
	}
}
