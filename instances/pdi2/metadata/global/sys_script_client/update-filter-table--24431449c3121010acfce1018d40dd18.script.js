function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue === "true") {
        var fieldValue = g_form.getValue('field');
        var entityTable = g_form.getValue('entity.table');
        if (fieldValue != '') {
            var gaPromin = new GlideAjax('global.ProminUtilsAJAX');
            gaPromin.addParam('sysparm_name', 'getReferenceTable');
            gaPromin.addParam('sysparm_referenceField', fieldValue);
            gaPromin.addParam('sysparm_modelDefTable', entityTable);
            gaPromin.getXML(getFilterTable);
        }
    } else {
        g_form.setValue('filter_table', '');
    }

    function getFilterTable(response) {
        var referenceTable = response.responseXML.documentElement.getAttribute("answer");
        if (referenceTable) {
            g_form.setValue('filter_table', referenceTable);
            g_form.setReadOnly('filter_table', true);
        } else {
            g_form.setValue('filter_table', '');
            g_form.setValue('has_filter', false);
        }
		g_form.setValue('filter', '');
    }
}
