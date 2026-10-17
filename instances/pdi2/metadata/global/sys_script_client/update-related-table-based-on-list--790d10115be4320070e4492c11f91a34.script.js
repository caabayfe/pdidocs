function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	//If value starts with REL:
	if (newValue.startsWith('REL:')) {
		getRelatedListTable(newValue);
	//Otherwise set form
	} else {
		g_form.setValue('related_table', newValue, newValue);
	}
	
}

function getRelatedListTable(relationship) {	
	var ga = new GlideAjax('GuidedTourFindRelatedTableAjax');
	ga.addParam('sysparm_name', 'getTable');
	ga.addParam('jvar_relationship', relationship);
	ga.getXML(ajaxResponse);
}

function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	var table = result[0].getAttribute("table");
	g_form.setValue('related_table', table, table);
}
