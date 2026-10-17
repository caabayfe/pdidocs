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
        logger.info("WWNA: JSON payload passed with Open Prompt Intent Detection Action: " + JSON.stringify(jsonPayload));



        PAYLOAD.action = sn_wwna.WWNAConstants.NACM_OPEN_PROMPT_ACTION;
        PAYLOAD.knowledge_graph = JSON.stringify(openPromptUtils.fetchKnowledgeGraph());
        PAYLOAD.available_trigger_actions = [];
        PAYLOAD.available_skill_actions = [];
        var actions = openPromptUtils.fetchNAcmActions(PAYLOAD.document_table, PAYLOAD.action_type ? [PAYLOAD.action_type] : []);
        var actionsGroupedByCommandName = actions.reduce((allActions, actionObj) => {
            let formmatedActionObj = {
                id: actionObj.commandName,
                description: actionObj.description
            };
            if (actionObj.actionType === 'UI_ACTIONS') {
                PAYLOAD.available_trigger_actions.push(formmatedActionObj);
            } else {
                PAYLOAD.available_skill_actions.push(formmatedActionObj);
            }
            allActions[actionObj.commandName] = actionObj;
            return allActions;
        }, {});
        PAYLOAD.available_trigger_actions = JSON.stringify(PAYLOAD.available_trigger_actions);
        PAYLOAD.available_skill_actions = JSON.stringify(PAYLOAD.available_skill_actions);
        // Fetch the context if it is not present already
        if (PAYLOAD.context.length === 0) {

            var skillContextObj = extensionConfig.getSkillContext({
                ...jsonPayload.payload,
                ambChannelName: ambChannelName
            });
            PAYLOAD.context = skillContextObj.context;
            logger.info("WWNA: fetched context inside Open Prompt Intent Detection Action: " + JSON.stringify(PAYLOAD.context));
        }


        // If context is null remove the loader from UI by sending the error message
        if (!PAYLOAD.context) {
            logger.info("WWNA: fetch context returned null inside Open Prompt Intent Detection Action");
            PAYLOAD.context = '';
        }



        // providing the promptConfigFilter will pick the right promptConfigID from sys_generative_ai_prompt_config
        var PROMPT_CONFIG_FILTERS = {
            "intent_detection": "true"
        };

        var promptFilters = extensionConfig.getPromptConfigFilters("intent_detection") || PROMPT_CONFIG_FILTERS;
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
            "mode": "sync",
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

        logger.info("WWNA: request for OneExtend capability in Open Prompt Intent Detection Action: " + JSON.stringify(request));

        // Call to the OneExtend Capability
        var response = sn_one_extend.OneExtendUtil.executeSecure(request);

        logger.info("WWNA: response of sync caller in Open Prompt Intent Detection Action: " + JSON.stringify(response));

        if (response.status === sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR) {
            gs.publish(ambChannelName, {
                "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                "errorMessage": utils.getErrorMessage(response)
            });
        } else {
            var capabilityResponse = response.capabilities[CAPABILITY_ID];
            if (String(capabilityResponse.isMoreInformationRequired) === "true") {
                response.features = {};
                response.features[CAPABILITY_ID] = {
                    result: JSON.parse(JSON.stringify(response.capabilities[CAPABILITY_ID]))
                };
                response.features[CAPABILITY_ID].status = response.capabilities[CAPABILITY_ID].status;
                delete response.capabilities;
                gs.publish(ambChannelName, response);
            } else {
                if (capabilityResponse.isDataFetchRequired && capabilityResponse.knowledgeGraphId) {
                    jsonPayload.payload.knowledge_graph_id = capabilityResponse.knowledgeGraphId;
                    jsonPayload.payload.modified_query_for_knowledge_graph = capabilityResponse.modifiedQueryForKnowledgeGraph;
                }
                var wwna_table = sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS;
                if (capabilityResponse.operationsToBePerformed?.length) {
                    if (capabilityResponse.operationsToBePerformed?.length === 1) {
                        let {
                            commandId,
                            instruction
                        } = capabilityResponse.operationsToBePerformed[0];
                        if (String(instruction || '').trim()) {
                            jsonPayload.payload.user_query = instruction;
                        }
                        let message = "/" + commandId + " " + JSON.stringify(jsonPayload);
                        let originalTableName = actionsGroupedByCommandName[commandId]?.tableName || PAYLOAD.document_table || sn_wwna.WWNAConstants.WWNA_BASE_ACTION_TABLE;
                        let tableId = originalTableName === sn_wwna.WWNAConstants.WWNA_BASE_ACTION_TABLE ? CAPABILITY_ID : PAYLOAD.document_id;
                        var quickActionResult = sn_snippets.QuickAction.invokeAction(originalTableName, tableId, message, this.context, wwna_table);
                        quickActionResult = quickActionResult && typeof quickActionResult === 'string' ? JSON.parse(quickActionResult) : quickActionResult;
                        if (quickActionResult && String(quickActionResult?.success) === 'false') {
                            gs.publish(ambChannelName, {
                                "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                                "errorType": "error",
                                "errorMessage": sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE
                            });
                        }
                    } else {
                        gs.publish(ambChannelName, openPromptUtils.preparePayloadForMultiAction(capabilityResponse, jsonPayload.payload, capabilityResponse.operationsToBePerformed, actionsGroupedByCommandName, CAPABILITY_ID));
                    }

                } else if (capabilityResponse.response?.length && capabilityResponse.response !== sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE) {
                    gs.publish(ambChannelName, openPromptUtils.preparePayloadForMultiAction(capabilityResponse, {}, [], actionsGroupedByCommandName, CAPABILITY_ID));
                } else {
                    logger.info('WWNA: Intent detection completed, but no actionable operations were found.');
                    gs.publish(ambChannelName, {
                        "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                        "errorType": "warning",
                        "errorMessage": sn_wwna.WWNAConstants.GENERIC_OPEN_PROMPT_ERROR_MESSAGE
                    });

                }
            }
        }
    } else {
        logger.error("WWNA: User doesn 't have access to execute the Open Prompt Intent Detection action/NAcm Skill");
        gs.publish(ambChannelName, {
            "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
            "errorMessage": sn_wwna.WWNAConstants.WWNA_ACL_FAILURE_MESSAGE
        });
    }
} catch (err) {
    logger.error("WWNA: Failed to execute Open Prompt Intent Detection Action. Error: " + err.message);
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
