function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (newValue == "form") {
		g_form.setDisplay('table', true);
		g_form.setDisplay('form_element', true);
		g_form.setDisplay('field', true);
		g_form.setDisplay('field_action', true);
		g_form.setDisplay('cxs_results', true);
		
		g_form.setDisplay('list_element', false);
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('frameset', false);
		g_form.setDisplay('manual_css', false);
		g_form.setDisplay('seismic_selector', false);
		g_form.setDisplay('js_path', false);
		
		g_form.setValue('manual_css', "");
		checkFormElement(g_form.getValue('form_element')); 
		
	} else if (newValue == "list") {
		g_form.setDisplay('table', true);
		g_form.setDisplay('list_element', true);
		g_form.setDisplay('field', true);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('record_id', true);
		
		g_form.setDisplay('form_element', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('frameset', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('manual_css', false);
		g_form.setDisplay('seismic_selector', false);
		g_form.setDisplay('js_path', false);
		
		g_form.setValue('manual_css', "");
		checkListElement(g_form.getValue('list_element'));
				
	} else if (newValue == "frameset") {
		g_form.setDisplay('frameset', true);
		
		g_form.setDisplay('table', false);
		g_form.setDisplay('ui_action', false);	
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('list_element', false);
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('form_element', false);
		g_form.setDisplay('form_buttons', false);
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
		g_form.setDisplay('manual_css', false);
		g_form.setDisplay('seismic_selector', false);
		g_form.setDisplay('js_path', false);
		
		g_form.setValue('manual_css', "");
		
	} else if (newValue == "manual_css" || newValue == "seismic_css") { 
		g_form.setDisplay('manual_css', true);
		g_form.setDisplay('seismic_selector', true);
		g_form.setDisplay('js_path', true);
		
		g_form.setDisplay('table', false);		
		g_form.setDisplay('ui_action', false);	
		g_form.setDisplay('list_element', false);
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('form_element', false);
		g_form.setDisplay('form_buttons', false);
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
		g_form.setDisplay('frameset', false);
	}
}
