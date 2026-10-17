function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (g_form.getValue('form_element') == 'related_list') {
		populateRelatedListField();
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
