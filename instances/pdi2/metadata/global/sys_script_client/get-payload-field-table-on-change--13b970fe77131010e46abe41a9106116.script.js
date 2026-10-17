function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var ga = new GlideAjax('SPSearchResultActions');
    ga.addParam('sysparm_name', 'getPayloadFieldDefTable');
    ga.addParam('sysparm_actionId', newValue);
    ga.getXML(getResponse);

    function getResponse(response) {
        var result = response.responseXML.getElementsByTagName("result");
        var payloadFieldTable = result[0].getAttribute('payloadFieldTable');
        if (payloadFieldTable)
            g_form.setValue('payload_field_table', payloadFieldTable);
    }
}
