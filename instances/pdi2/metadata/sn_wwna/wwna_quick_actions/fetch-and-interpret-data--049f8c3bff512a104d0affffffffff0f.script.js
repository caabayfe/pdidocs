// Logger initialization
var logger = new sn_wwna.WWNALogger();
var ambChannelName;

try {
    // Convert the payload in string to escape quotes.
    var stringifiedPayload = JSON.stringify(params[0]);

    // Escape the characters & < > from the string
    var escapedPayload = global.JSUtil.escapeText(stringifiedPayload);

    // unescape HTML if escaped already
    var unEscapedPayload = GlideStringUtil.unEscapeHTML(escapedPayload);

    // parse the strigified Payload
    var param = JSON.parse(unEscapedPayload);

    var jsonPayload = JSON.parse(param);
    ambChannelName = jsonPayload.ambChannel;

    var extensionConfig = new sn_wwna.WWNAConfigImpl(jsonPayload.payload.document_table_name, jsonPayload.payload.document_sys_id, jsonPayload.payload.skill_id);
    var CAPABILITY_ID = sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID;
    var utils = new global.WWNAGlobalUtils();
	var openPromptUtils = new sn_wwna.NacmOpenPromptUtils();
    var PAYLOAD = utils.createPayload(jsonPayload.payload, true);
    const hasAccessToSkill = utils.hasAccessToSkill(PAYLOAD.skill_config_id, CAPABILITY_ID, sn_wwna.WWNAConstants.WWNA_DEFAULT_SKILL_CONFIG_ID);
    if (hasAccessToSkill) {
        logger.info("WWNA: JSON payload passed with Data Interpreter Action: " + JSON.stringify(jsonPayload));
        PAYLOAD.action = "dataInterpreter";
        const KNOWLEDGE_GRAPH_CAPABILITY_ID = sn_wwna.WWNAConstants.KNOWLEDGE_GRAPH_CAPABILITY_ID;
        var knowledgeGraphOutput = [];
        var knowledgeQueryInstruction = PAYLOAD.modified_query_for_knowledge_graph || PAYLOAD.user_query;
        if (PAYLOAD.knowledge_graph_id && (knowledgeQueryInstruction)) {
            let knowledgeGraphResponse = openPromptUtils.fetchDataThroughGraph(knowledgeQueryInstruction, PAYLOAD.knowledge_graph_id);
            let capabilityResponse = Object.assign({}, JSON.parse(JSON.stringify(knowledgeGraphResponse.capabilities[KNOWLEDGE_GRAPH_CAPABILITY_ID])));
            delete knowledgeGraphResponse.capabilities;
            let knowledgeGraphOutput = capabilityResponse.response;
            if (knowledgeGraphOutput?.length) {
                PAYLOAD.model_output = JSON.stringify(knowledgeGraphOutput);
                // providing the promptConfigFilter will pick the right promptConfigID from sys_generative_ai_prompt_config
                var PROMPT_CONFIG_FILTERS = {
                    "data_interpreter": "true"
                };

                var promptFilters = extensionConfig.getPromptConfigFilters("data_interpreter") || PROMPT_CONFIG_FILTERS;
                var targetLanguage = extensionConfig.getTargetLanguage();

                // Request payload for the capability
                var request = {
                    "executionRequests": [{
                        "payload": PAYLOAD,
                        "meta": {
                            "configFilters": promptFilters,
                            "skillConfigId": PAYLOAD.skill_config_id,
                            "source": jsonPayload.payload.trigger_source,
                            "documentId": jsonPayload.payload.document_sys_id,
                            "documentTable": jsonPayload.payload.document_table_name
                        },
                        'returnRequest': true,
                        "capabilityId": CAPABILITY_ID
                    }],
                    "mode": "async",
                    "ambCallbackChannel": ambChannelName,
                    "timeout": 20
                };

                if (targetLanguage) {
                    request.executionRequests[0].meta.dtTargetLanguage = targetLanguage;
                }
                // get the groupId in case of refine action is performed
                if (jsonPayload.payload.trigger_source === sn_wwna.WWNAConstants.ACTION_TYPES.REFINE) {
                    var groupId = "";
                    groupId = extensionConfig.getGroupId();
                    if (groupId)
                        request.executionRequests[0].meta.__groupId = groupId;
                }

                logger.info("WWNA: request for OneExtend capability in Data InterPreter Action: " + JSON.stringify(request));

                // Call to the OneExtend Capability
                let response = sn_one_extend.OneExtendUtil.executeSecure(request);

                logger.info("WWNA: response of async caller in Data InterPreter Action: " + JSON.stringify(response));

                if (response.status === sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR) {
                    gs.publish(ambChannelName, {
                        "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                        "errorMessage": utils.getErrorMessage(response)
                    });
                }
            } else {
                capabilityResponse.response = sn_wwna.WWNAConstants.GENERIC_NO_DATA_FOUND_MESSAGE;
                knowledgeGraphResponse.features = {
                    [KNOWLEDGE_GRAPH_CAPABILITY_ID]: {
                        result: Object.assign(capabilityResponse, {
                            subState: sn_wwna.WWNAConstants.ONE_EXTEND_SUB_STATES.EMPTY_RESPONSE
                        }),
                        status: capabilityResponse.status
                    }
                };
                gs.publish(ambChannelName, knowledgeGraphResponse);
            }
        } else {
            gs.publish(ambChannelName, {
                "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                "errorMessage": sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE
            });
        }
    } else {
        logger.error("WWNA: User doesn 't have access to execute the Fetch and Interpret Data action/NAcm Skill");
        gs.publish(ambChannelName, {
            "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
            "errorMessage": sn_wwna.WWNAConstants.WWNA_ACL_FAILURE_MESSAGE
        });
    }
} catch (err) {
    logger.error("WWNA: Failed to execute Fetch and Interprete Data Action. Error: " + err.message);
    if (ambChannelName) {
        gs.publish(ambChannelName, {
            "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
            "errorType": "error",
            "errorMessage": sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE
        });
    }
}


answer = {
    success: true,
    message: ""
};
