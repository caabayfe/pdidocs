function onChange(control, oldValue, newValue, isLoading) {
    var isTemplateMode = g_form.$private.getField('sysparm_template_name');
    if (isTemplateMode) {
        g_form.setDisplay('fulfillment_steps', false);
        g_form.setDisplay('delivery_time_var', false);
        g_form.clearValue('fulfillment_steps');
        return;
    }

    if (newValue == '') {
        g_form.setDisplay('fulfillment_steps', false);
        g_form.setDisplay('delivery_time_var', false);
        return;
    }

    var ERROR_MESSAGE_VALIDATION_FAILED = getMessage('Error while fetching the SC flow registry data');
    var url = 'api/now/table/sc_service_fulfillment_flow_registry?sysparm_query=active=true^service_fulfillment_flow=' + g_form.getValue('flow_designer_flow');

    glideRequest.get(url, {}).then(function(response) {
        if (!response.ok)
            throw new Error(ERROR_MESSAGE_VALIDATION_FAILED);

        return response.json();
    }).then(function(data) {
        var result = data.result;
        g_form.setDisplay('fulfillment_steps', result.length > 0);
        g_form.setDisplay('delivery_time_var', result.length > 0);
    }, errorHandler);


    function errorHandler() {
        g_form.setDisplay('fulfillment_steps', false);
        g_form.setDisplay('delivery_time_var', false);
        g_form.addErrorMessage(ERROR_MESSAGE_VALIDATION_FAILED);
    }
}
