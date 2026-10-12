var GenAILargeInputPostprocessor = Class.create();
GenAILargeInputPostprocessor.prototype = {
    initialize: function() {
    },

    /**
     * Converts chunk results to combine prompt
     *
     * @param {Object} combineRequestAttributes - Attributes for combine
	 * request with chunk results.
	 * @param {String} capabilityId - Capability ID for the capability.
     *
     * @return {Object} - Combine request attributes.
     */
    process: function(combineRequestAttributes, capabilityId) {
    },

	/**
     * Checks if the current instance is appropriate for a given
	 * capabilityId and definitionId
     *
     * @param {String} capabilityId - The sys_id for the capability.
	 * @param {String} definitionId - The sys_id for the capability definition.
     *
     * @return {Boolean} true/false - is the instance valid or not.
     */
	validateHandler: function (capabilityId, definitionId) {
	},

    type: 'GenAILargeInputPostprocessor'
};
