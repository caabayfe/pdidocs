(function executeRule(current, previous /*null when async*/ ) {

    if (previous.action_type != current.action_type) {
        var actionType = current.action_type.getRefRecord();
        var clientParams = (actionType.getValue("client_parameters") || "").replaceAll(" ", "").split(",");
        var serverParams = (actionType.getValue("server_parameters") || "").replaceAll(" ", "").split(",");
        var actionId = current.getUniqueValue();
        var table = current.getValue('table');
        setParameters(clientParams, actionId, table, true);
        setParameters(serverParams, actionId, table, false);
    }

})(current, previous);

function setParameters(parameters, actionId, tableName, is_client) {
    var gr = new GlideRecord('sn_ex_sp_action_parameter');
    gr.addQuery("is_client", is_client);
    gr.addQuery("action", actionId);
    gr.query();
    while (gr.next()) {
        var paramName = gr.getValue('name');
        if (parameters.indexOf(paramName) < 0) {
            gr.deleteRecord();
        } else {
            parameters = parameters.filter(function(x) {
                return x != paramName;
            });
        }
    }
    parameters.map(function(x) {
        if (x) {
            var initializeGr = new GlideRecord('sn_ex_sp_action_parameter');
            initializeGr.initialize();
            initializeGr.setValue('parameter_type', 'string');
            initializeGr.setValue('name', x.trim());
            initializeGr.setValue('action', actionId);
            initializeGr.setValue('table', tableName);
            initializeGr.setValue('is_client', is_client);
            initializeGr.insert();
        }
    });
}
