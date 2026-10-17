var WWNAConfig = Class.create();
WWNAConfig.prototype = {
    initialize: function() {},

    /**
     * Get filters for wwna skill config, required for NAcm
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @return {Object} Object of the filter to be used to fetch the WWNA skill configurations
     **/
    getFilters: function(table, sysId, skillId) {
        return {};
    },

    /**
     * Get additional config like autogrowLevel for actions, required for consumers of NACM to handle this
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @param {Object} skillConfigObject - The skillConfigObject which can be sued to identify if WWNA will be active or not.
     * 
     * @return {Object} Object containing the additional configuration
     **/
    getAdditionalConfig: function(table, sysId, skillId, skillConfigObject) {
        return {};
    },

    /**
     * Get more context for LLM execution in the WWNA actions e.g. Chat History in case of chat. Required for common capabilities
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @param {Object} payload - The payload object to check the dirty fields.
     * 
     * @return {String} Context to be passed to the LLM
     **/
    getContext: function(table, sysId, skillId, payload) {
        return "";
    },

    /**
     * Get SkillConfig Object if the usage of the NAcm methods to fetch object is not satisfactory
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @return {Object} Object of the skill configurations
     **/
    getSkillConfigObj: function(table, sysId, skillId) {
        return {
            isErrored: true
        };
    },

    /**
     * Get a flag if WWNA will be active or not. If not implemented implictly considered as true, required for NAcm
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @param {Object} skillConfigObject - The skillConfigObject which can be sued to identify if WWNA will be active or not.
     * 
     * @return {boolean} return if wwna will be rendered or not
     **/
    isWWNAActive: function(table, sysId, skillId, skillConfigObject) {
        return true;
    },

    /**
     * Is extension point implementation for WWNA valid, required for NAcm and common capabilities both
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @return {boolean} Boolean flag that returns true if the combination of table sysId and skillId uniquely satisfies the implementation
     **/
    isValid: function(table, sysId, skillId) {
        return true;
    },

    /**
     * To get the groupId in case of refine actions getting triggered, required for NAcm
     */
    getGroupId: function(table, sysId, skillId) {
        return "";
    },

    /**
     * pre Validate handler for the Inputs, Required for common capabilities
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @param {String} selected_text - The selected text for processing.
     * 
     * @param {String} drafted_text - The drafted text for processing.
     * 
     * @return {Object} object of following type
     * {
     *     isValid: {boolean} | Mandatory: if false provide a message to be rendered in the model and a type
     *     errorMessage: {string} | Optional: if isValid is false, the message will be placed in the model
     *     errorType: {string} | Optional | ["warning"|"error"]: if isValid is false, warning: circular icon, error: triangular icon.
     * }
     **/
    preValidateInputs: function(table, sysId, skillId, selectedText, draftedText) {
        return {
            isValid: true
        };
    },

    /**
     * PreProcessing handler for the Inputs, Required for common capabilities
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @param {Object} inputs - The inputs to be pre-processed.
     * 
     * @return {Object} Processed Input Object should be returned from here.
     *
     * @param {String} modelProvider - The model provider for the skill.
     **/
    preProcessInputs: function(table, sysId, skillId, inputs, modelProvider = "") {
        return inputs;
    },

    /**
     * PostProcessing handler for the Outputs, Required for common capabilities
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @param {Object} outputs - The outputs object emitted by LLM.
     * 
     * @return {Object} Processed Output Object should be returned from here.
     *
     * @param {String} modelProvider - The model provider for the skill.
     **/
    postProcessOutputs: function(table, sysId, skillId, outputs, modelProvider = "") {
        return outputs;
    },

    /**
     * A handler for providing the additionalAnalyticsAttributes, Required for common capabilities
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @param {String} additionalDataStringifiedObject - The additionalDataStringifiedObject for the wwna execution.
     * 
     * @return {String} Processed and stringified JSON Object which will be added into the caller column of the gen ai log table.
     **/
    additionalAnalyticsData: function(table, sysId, skillId, additionalDataStringifiedObject) {
        return "";
    },

    /**
     * A handler for providing the truncation Stratergy, Required for common capabilities
     * 
     * @param {String} table - The table name of the parent record.
     * 
     * @param {String} sysId - The sys_id of the parent record.
     * 
     * @param {String} skillId - The SkillId for the skill config.
     * 
     * @return {Object} Processed payload to send to the LLM request.
     **/
    addTruncation: function(table, sysId, skillId, payload, attrsWithTruncationEnabled, provider, remainingTokens) {
        return payload;
    },

    /**
     * A handler for providing the Prompt Filters, Required for common capabilities
     * 
     * @param {Object} actionCommandName - The action command name which can help in deciding the correct prompt filter to return.
     * 
     * @return {Object} Prompt config Filter to use.
     **/
    getPromptConfigFilters: function(table, sysId, skillId, actionCommandName) {
        return null;
    },

    /**
     * A handler for getting the target language, Required for common capabilities
     * 
     * @return {string} target language for the common capabilities.
     **/
    getTargetLanguage: function(table, sysId, skillId) {
        return null;
    },

    /**
     * A handler for getting the target domain for a domain seprated instance, Use this, if the target domain is different from the domain of the record constructed through (table and sysId)
     * 
     * @return {GlideRecord} target domain GlideRecord.
     **/
    getDomainGr: function(table, sysId, skillId) {
        return null;
    },

	/**
     * A handler to disable skill config merge dynamically
     * 
     * @return {GlideRecord} target domain GlideRecord.
     **/
	shouldDisableMerge: function(table, sysId, skillId){
		return skillId === sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID ? false : true;
	},


    type: 'WWNAConfig'
};
