function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    setDefaultDisplayFields(newValue);
}

function setDefaultDisplayFields(tableName) {
    var ga = new GlideAjax('ApprovalConfigurationUtil');
    ga.addParam('sysparm_name', 'getValidatedFieldsFromDefaults');
    ga.addParam("sysparm_tableName", tableName);
    ga.addParam("sysparm_fieldsList", "number,short_description,opened_by,requested_by,start_date,end_date,quantity,price,recurring_price,recurring_frequency");
    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        g_form.setValue("display_fields", answer);
    });
}
