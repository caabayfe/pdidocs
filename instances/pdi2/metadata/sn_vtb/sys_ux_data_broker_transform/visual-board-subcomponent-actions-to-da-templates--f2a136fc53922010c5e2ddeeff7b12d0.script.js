function transform(input) {
    var daTemplateToActionName = JSON.parse(input.daTemplateToActionName);
    var config = {
        daActionMapping: {}
    };
    if (!daTemplateToActionName)
        return config;
    var assignmentIds = [];
    for (var assignmentId in daTemplateToActionName)
        assignmentIds.push(assignmentId);

    if (!assignmentIds.length)
        return config;

    var assignmentGR = new GlideRecord("sys_declarative_action_assignment");
    assignmentGR.addQuery("sys_id", assignmentIds);
    assignmentGR.addActiveQuery();
    assignmentGR.query();
    var daActionMapping = {};
    while (assignmentGR.next()) {
        var clientActionId = assignmentGR.getValue("client_action");
        if (clientActionId) {
            var payloadDef = new GlideRecord("sys_declarative_action_payload_definition");
            if (payloadDef.get(clientActionId)) {
                var actionId = assignmentGR.getUniqueValue();
                daActionMapping[daTemplateToActionName[actionId]] = {
                    "assignmentId": actionId,
                    "name": payloadDef.getValue("action_key"),
                    "label": assignmentGR.getValue("label"),
                    "actionType": "uxf_client_action",
                    "actionDispatch": payloadDef.getValue("action_key"),
                    "actionPayload": payloadDef.getValue("payload_template")
                };
            }
        }
    }
    config.daActionMapping = daActionMapping;
    return config;
}
