function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
       return;
    }

    //The picked new filter should update the table field
	if(g_form.getReference("filter").table != g_form.getValue("table")) {
		var newTable = g_form.getReference("filter").table;
		g_form.setValue("table", newTable);
		CertificationTemplateUtils.dependentTable = newTable;
		CertificationTemplateUtils.certTemplateTable = newTable;
		CertificationTemplateUtils.cancelFilter();
		CertificationTemplateUtils.checkAttrCondValidity();
		CertificationTemplateUtils.dependentTableRelatedListsJSON = null;
		
		var ga = new GlideAjax('ConditionUtilsAjax');
		ga.addParam('sysparm_name', 'getRelatedLists');
		ga.addParam('sysparm_dependent_table', newTable);
		ga.getXML(ajaxResponse);
	}
}

function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	CertificationTemplateUtils.dependentTableRelatedLists = result[0].getAttribute("relatedList");
}
