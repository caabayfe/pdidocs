var NAALLMChangeHistoryAPI = {
    /**
     * Inserts model provider change history records for each skill config update provided.
     *
     * @param {Array<Object>} changeData - An array of change records. Each object should include:
     *    - activity_details: (String) (Provider updated - Providers, Fallback, Routing) Include only the fields that have been updated.
     *    - allowed_providers: (List) Array of sys_id(s) from sys_generative_ai_provider_mapping table.
     *    - fallback: (boolean) 
     *    - routing: (String) (Choices: "Global", "Regional").
     *
     * @param {String} domain - The sys_domain to associate with the record (default: "global").
     */
    setPolicyUpdateData: function(changeData, domain = "global") {
        try {
            var result = [];
            domain = gs.nil(domain) ? "global" : domain;
            for (var changeObj of changeData) {
                var sysId = NAALlmChangeHistoryUtil._insertPolicyChangeHistoryRecord(changeObj, domain);
                if (sysId) {
                    result.push(sysId);
                }
            }
            return result;
        } catch (error) {
            gs.error("Error in NAALLMChangeHistoryAPI.setPolicyUpdateData function:" + error.toString());
            return [];
        }
    },

    type: 'NAALLMChangeHistoryAPI'
};
