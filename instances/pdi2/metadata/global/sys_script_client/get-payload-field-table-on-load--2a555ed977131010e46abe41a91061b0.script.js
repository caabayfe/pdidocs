function onLoad() {

    var ga = new GlideAjax('SPSearchResultActions');
    var payload_field_table = g_form.getValue('payload_field_table');
    if (!payload_field_table) {
        var actionId = g_form.getValue('action_name') || "d46f400473211010c342d5fdbdf6a7cf";
        ga.addParam('sysparm_name', 'getPayloadFieldDefTable');
        ga.addParam('sysparm_actionId', actionId);
        ga.getXML(getResponse);
    }

    function getResponse(response) {
        var result = response.responseXML.getElementsByTagName("result");
        var payloadDefTable = result[0].getAttribute('payloadFieldTable');
        if (payloadDefTable) {
            g_form.setValue('payload_field_table', payloadDefTable);
        }

    }
}
