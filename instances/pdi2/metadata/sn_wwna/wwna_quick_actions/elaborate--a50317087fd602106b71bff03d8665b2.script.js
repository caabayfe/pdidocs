// Logger initialization
var logger = new sn_wwna.WWNALogger();
var ambChannelName;
try {
    var wwnaUtils = new sn_wwna.WWNAUtils();
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

    var preValidateResponse = extensionConfig.preValidateInputs(jsonPayload.payload.selected_text, jsonPayload.payload.drafted_text);
    const CAPABILITY_ID = sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID;
    var utils = new global.WWNAGlobalUtils();
    var PAYLOAD = utils.createPayload(jsonPayload.payload, false);
    const hasAccessToSkill = utils.hasAccessToSkill(PAYLOAD.skill_config_id, CAPABILITY_ID, sn_wwna.WWNAConstants.WWNA_DEFAULT_SKILL_CONFIG_ID);
    if (preValidateResponse.isValid) {
        if (hasAccessToSkill) {
            logger.info("WWNA: JSON payload passed with Elaborate Action: " + JSON.stringify(jsonPayload));


            if (jsonPayload.payload.citations) {
                PAYLOAD.citations = JSON.stringify(jsonPayload.payload.citations);
            }

            // Fetch the additional_context if it is not present already
            if (PAYLOAD.additional_context.length === 0) {
                jsonPayload.payload.action = "elaborate";
                var skillContextObj = extensionConfig.getSkillContext({
                    ...jsonPayload.payload,
                    ambChannelName: ambChannelName
                });
                PAYLOAD.additional_context = skillContextObj.context;
                logger.info("WWNA: fetched additional_context inside Elaborate Action: " + JSON.stringify(PAYLOAD.additional_context));
            }


            // If additional_context is null remove the loader from UI by sending the error message
            if (!PAYLOAD.additional_context) {
                logger.info("WWNA: fetch additional_context returned null inside Elaborate Action");
                PAYLOAD.additional_context = '';
            }



            // providing the promptConfigFilter will pick the right promptConfigID from sys_generative_ai_prompt_config
            var PROMPT_CONFIG_FILTERS = {
                "elaborate": "true"
            };

            var promptFilters = extensionConfig.getPromptConfigFilters("elaborate") || PROMPT_CONFIG_FILTERS;
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

            logger.info("WWNA: request for OneExtend capability in Elaborate Action: " + JSON.stringify(request));

            // Call to the OneExtend Capability
            var response = sn_one_extend.OneExtendUtil.executeSecure(request);

            logger.info("WWNA: response of async caller in Elaborate Action: " + JSON.stringify(response));

            if (response.status === sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR) {
                gs.publish(ambChannelName, {
                    "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                    "errorMessage": utils.getErrorMessage(response)
                });
            }

        } else {
            logger.error("WWNA: User doesn 't have access to execute the Elaborate action/NAcm Skill");
            gs.publish(ambChannelName, {
                "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                "errorMessage": sn_wwna.WWNAConstants.WWNA_ACL_FAILURE_MESSAGE
            });
        }

    } else if (!preValidateResponse.skipErrorMessage) {
        gs.publish(ambChannelName, {
            "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
            "errorMessage": preValidateResponse.errorMessage,
            "type": preValidateResponse.errorType
        });
    }
} catch (err) {
    logger.error("WWNA: Failed to execute Elaborate Action. Error: " + err.message);
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
