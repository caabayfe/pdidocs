var GenAILargeInputPreprocessor = Class.create();
GenAILargeInputPreprocessor.prototype = {
    initialize: function() {
    },

    /**
     * Converts a GenAI request from large input to parts with chunks.
     *
     * @param {String} input - GenAI input request, JSON, stringified.
     * @param {Number} remainingTokens - Remaining tokens in the request.
	 * @param {Number} maxTokens - Maximum response tokens for a request.
     * @param {String} provider - Name of the LLM service provider.
     *
     * @return {Object}
     * {
     *  parentFilter: {Object} - Filters for the combine prompt,
     *  parts: {Array} - Part objects containing input attributes, chunked attribute and filter
     * }
     */
    process: function(input, remainingTokens, maxTokens, provider) {
    },

	/**
     * Checks if the current instance is appropriate for a given
	 * capabilityId and definitionId
     *
     * @param {String} capabilityId - The sys_id for the capability.
	 * @param {String} definitionId - The sys_id for the capability definition.
     *
     * @return {Boolean} true/false - is the handler instance valid or not.
     */
	validateHandler: function (capabilityId, definitionId) {
	},

	/**
     * Invokes TokenCalculator to count remaining
	 * number of tokens in the request prompt
     *
     * @param {String} prompt - Prompt template.
	 * @param {Number} requestTokens - Request token limit.
	 * @param {String} provider - Name of the LLM service provider.
     *
     * @return {Number} - Number of remaining tokens in the prompt.
     */
	countRemainingTokens: function (prompt, requestTokens, provider) {
	},

	/**
     * Checks if recursive execution is required by checking
	 * for large text
     *
     * @param {String} payload - Input payload.
	 * @param {Number} remainingTokens - Token limit remaining.
	 * @param {String} provider - Name of the LLM service provider.
     *
     * @return {Boolean} - Whether given input payload contains large text.
     */
	isLargeText: function (payload, remainingTokens, provider) {
	},

    type: 'GenAILargeInputPreprocessor'
};
