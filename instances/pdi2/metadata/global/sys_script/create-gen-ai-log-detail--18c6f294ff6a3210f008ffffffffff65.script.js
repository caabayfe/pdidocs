(function executeRule(current, previous) {
    var FEATURE_INVOCATION_TABLE = 'one_api_service_plan_feature_invocation';
    var genAILogId = current.getUniqueValue();
    // fetch context
    var context = fetchContextFromFeatureInvocation();
    // insert into sys_gen_ai_log_detail table
    sn_one_extend.OneExtendUtil.insertGenAILogDetail({
        'genAILogId': genAILogId,
        "context": context
    });

    /**
     * Fetches context from feature invocation record
     * @returns {string} The prompt context or empty string
     */
    function fetchContextFromFeatureInvocation() {
        if (gs.nil(current.feature_invocation)) {
            gs.warn(sn_i18n.Message.getMessage("global", "Create Gen AI log Detail BR: Feature invocation is null or invalid for log - {genAILogId}", {
                "genAILogId": genAILogId
            }));
            return '';
        }

        var featureInvocationGr = new GlideRecord(FEATURE_INVOCATION_TABLE);
        if (!featureInvocationGr.get(current.feature_invocation)) {
            gs.warn(sn_i18n.Message.getMessage("global", "Create Gen AI log Detail BR: Feature invocation record not found for log - {genAILogId}", {
                "genAILogId": genAILogId
            }));
            return '';
        }

        var transactionId = featureInvocationGr.service_plan_invocation.app_transaction_id + '';
        var metaStr = featureInvocationGr.getValue('meta');

        if (gs.nil(transactionId) || gs.nil(metaStr)) {
            gs.error(sn_i18n.Message.getMessage("global", "Create Gen AI log Detail BR: Transaction ID or Metadata missing for log - {genAILogId}", {
                "genAILogId": genAILogId
            }));
            return '';
        }

        try {
            var meta = JSON.parse(metaStr);
            var configId = (current.prompt_config_id &&
                    current.prompt_config_id.ai_config &&
                    current.prompt_config_id.ai_config.toString()) ||
                (meta && meta.configId) ||
                null;
            if (gs.nil(configId)) {
                gs.warn(sn_i18n.Message.getMessage("global", "Create Gen AI log Detail BR: No configId found for log - {genAILogId}", {
                    "genAILogId": genAILogId
                }));
                return '';
            }
            return sn_one_extend.OneExtendUtil.getPromptContext(configId, transactionId, meta);
        } catch (parseErr) {
            gs.error(sn_i18n.Message.getMessage("global", "Create Gen AI log Detail BR: Failed to parse meta JSON: {error} for log - {genAILogId}", {
                "error": parseErr,
                "genAILogId": genAILogId
            }));
            return '';
        }
    }


})(current, previous);
