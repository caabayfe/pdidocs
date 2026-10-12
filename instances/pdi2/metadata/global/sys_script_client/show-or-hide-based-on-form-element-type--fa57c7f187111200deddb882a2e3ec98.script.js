function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (newValue == "field") {
		g_form.setDisplay('field', true);
		g_form.setDisplay('field_action', true);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('filters', false);
		
	} else if (newValue == "field_label") {
		g_form.setDisplay('field', true);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('filters', false);

	} else if (newValue == "ui_action") {
		g_form.setDisplay('ui_action', true);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('filters', false);

	} else if (newValue == "form_section") {
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', true);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('filters', false);

	} else if (newValue == "form_section_tab_only") {
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', true);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('filters', false);

	} else if (newValue == "related_list") {
		g_form.setDisplay('ui_action', true);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		populateRelatedListField();
		g_form.setDisplay('related_lists', true);
		g_form.setDisplay('related_list_element', true);
		g_form.setDisplay('related_table', true);
		g_form.setDisplay('related_links', false);
		checkRelatedListElement(g_form.getValue('related_list_element'));
		
	} else if (newValue == "form_buttons") {
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('form_buttons', true);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('filters', false);
	
	} else if (newValue == "cxs_results") {
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', true);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('filters', false);
	
	} else if (newValue == "related_links") {
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', true);
		g_form.setDisplay('filters', false);
	}
}

function checkRelatedListElement(relatedListElement) {
	if (relatedListElement == "ui_action") {
		g_form.setDisplay('ui_action', true);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	} else if (relatedListElement == "tab_section") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	} else if (relatedListElement == "tab_section_tab_only") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	} else if (relatedListElement == "filters") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', true);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	} else if (relatedListElement == "field_header") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', true);
		g_form.setDisplay('field_header', true);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	} else if (relatedListElement == "list_header") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', true);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
	} else if (relatedListElement == "cell_types") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', true);
		g_form.setDisplay('cell_edit', false);
	} else if (relatedListElement == "cell_edit") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', true);
	}
}

function populateRelatedListField() {	
	var ga = new GlideAjax('LoadRelatedListsOnSelectAjax');
	ga.addParam('sysparm_name', 'getRelatedLists');
	ga.addParam('jvar_table', g_form.getValue('table'));
	ga.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	g_form.clearOptions('related_lists');
	for (var i = 0; i < result.length; i++) {
		var key = result[i].getAttribute("related_list_key");
		var value = result[i].getAttribute("related_list_value");
		g_form.addOption('related_lists', key, value);
	}
}
