function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (newValue == "ui_action") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('ui_action', true);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);

	} else if (newValue == "list_record") {
		g_form.setDisplay('record_id', true);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);

	} else if (newValue == "grid") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', true);
		g_form.setDisplay('col', true);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);

	} else if (newValue == "field_header") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', true);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', true);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		
	} else if (newValue == "filters") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', true);
	
	} else if (newValue == "list_header") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', true);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		
	} else if (newValue == "related_links") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', true);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		
	} else if (newValue == "cell_types") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', true);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		
	} else if (newValue == "cell_edit") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', true);
		g_form.setDisplay('filters', false);
	}
}
