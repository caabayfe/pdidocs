function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading) {
        return;
    }

    //Clear default value on change of lookup table

    var defaultValueDetails = g_form.getValue('default_value_details');
    try {
        defaultValueDetails = JSON.parse(defaultValueDetails);
    } catch (error) {
        defaultValueDetails = {
            defaultValue: {}
        };
    }
    defaultValueDetails.defaultValue.value = '';
    defaultValueDetails.defaultValue.displayValue = '';
    g_form.setValue('default_value_details', JSON.stringify(defaultValueDetails));
    g_form.setReadOnly('default_value_details', false);

    if (newValue == '')
        return;

    var ga = new GlideAjax('global.QuestionCreationWizardUtils');
    ga.addParam('sysparm_name', 'getDisplayColumn');
    ga.addParam('sysparm_table_name', newValue);
    ga.getXML(handleResponse);

    function handleResponse(serverResponse) {
        var answer = serverResponse.responseXML.documentElement.getAttribute("answer");
        g_form.setValue("lookup_table_display_field", answer);

    }
}
