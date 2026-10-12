function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var fieldValue;
    if (isLoading || newValue === '') {
        return;
    }
    var entityTable = g_form.getValue('entity.table');
    var gaPromin = new GlideAjax('global.ProminUtilsAJAX');
    gaPromin.addParam('sysparm_name', 'getReferenceTable');
    gaPromin.addParam('sysparm_referenceField', newValue);
    gaPromin.addParam('sysparm_modelDefTable', entityTable);
    gaPromin.getXML(getReferenceTableResponse);
}

function getReferenceTableResponse(response) {
    var referenceTable = response.responseXML.documentElement.getAttribute("answer");
    if (referenceTable) {
        g_form.setDisplay('has_filter', true);
		
    } else {
        g_form.setDisplay('has_filter', false);
    }
	g_form.setValue('has_filter', false);
	g_form.setValue('filter_table', '');
}
