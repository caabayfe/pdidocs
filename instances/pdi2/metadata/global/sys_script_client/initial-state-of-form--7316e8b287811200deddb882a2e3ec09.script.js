function onLoad() {	
	checkElementType(g_form.getValue('type')); 
}

function checkElementType(elementType) {
	if (elementType == "form") {
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
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('frameset', false);
		g_form.setDisplay('manual_css', false);
		g_form.setValue('manual_css', "");
		checkFormElement(g_form.getValue('form_element')); 
		
	} else if (elementType == "list") {
		g_form.setDisplay('table', true);
		g_form.setDisplay('list_element', true);
		g_form.setDisplay('field', true);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('record_id', true);
		
		g_form.setDisplay('form_element', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('frameset', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('manual_css', false);
		g_form.setValue('manual_css', "");
		checkListElement(g_form.getValue('list_element'));
				
	} else if (elementType == "frameset") {
		g_form.setDisplay('frameset', true);
		
		g_form.setDisplay('table', false);
		g_form.setDisplay('ui_action', false);	
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('list_element', false);
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('form_element', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('manual_css', false);
		g_form.setValue('manual_css', "");
		
	} else if (elementType == "manual_css") {
		g_form.setDisplay('manual_css', true);
		
		g_form.setDisplay('table', false);		
		g_form.setDisplay('ui_action', false);	
		g_form.setDisplay('list_element', false);
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('related_lists', false);
		g_form.setDisplay('related_list_element', false);
		g_form.setDisplay('related_table', false);
		g_form.setDisplay('related_field', false);
		g_form.setDisplay('related_links', false);
		g_form.setDisplay('form_element', false);
		g_form.setDisplay('form_buttons', false);
		g_form.setDisplay('form_section', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('frameset', false);
	}
}

function checkListElement(listElement) {
	if (listElement == "ui_action") {
		g_form.setDisplay('ui_action', true);
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', false);

	} else if (listElement == "list_record") {
		g_form.setDisplay('record_id', true);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', false);

	} else if (listElement == "grid") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', true);
		g_form.setDisplay('col', true);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', false);

	} else if (listElement == "field_header") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', true);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', true);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', false);
		
	} else if (listElement == "filters") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', true);
		g_form.setDisplay('related_links', false);
	
	} else if (listElement == "related_links") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', true);
	
	} else if (listElement == "list_header") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', true);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', false);
	
	} else if (listElement == "cell_types") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', true);
		g_form.setDisplay('cell_edit', false);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', false);


	} else if (listElement == "cell_edit") {
		g_form.setDisplay('record_id', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('list_header', false);
		g_form.setDisplay('field_header', false);
		g_form.setDisplay('row', false);
		g_form.setDisplay('col', false);
		g_form.setDisplay('cell_types', false);
		g_form.setDisplay('cell_edit', true);
		g_form.setDisplay('filters', false);
		g_form.setDisplay('related_links', false);
	}
}

function checkFormElement(formElement) {
	if (formElement == "field") {
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
		
	} else if (formElement == "field_label") {
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

	} else if (formElement == "ui_action") {
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

	} else if (formElement == "form_section") {
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

	} else if (formElement == "form_section_tab_only") {
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

	} else if (formElement == "related_list") {
		g_form.setDisplay('ui_action', false);
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
		
	} else if (formElement == "form_buttons") {
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
		
	} else if (formElement == "cxs_results") {
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
	}
	
	else if (formElement == "related_links") {
		g_form.setDisplay('ui_action', false);
		g_form.setDisplay('field', false);
		g_form.setDisplay('field_action', false);
		g_form.setDisplay('cxs_results', false);
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
	var current = g_form.getValue('related_lists');
	g_form.clearOptions('related_lists');
	for (var i = 0; i < result.length; i++) {
		var key = result[i].getAttribute("related_list_key");
		var value = result[i].getAttribute("related_list_value");
		g_form.addOption('related_lists', key, value);
		if (key == current) {
			g_form.setValue('related_lists', key, value);
		}
	}
}
