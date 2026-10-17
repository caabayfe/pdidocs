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
		Object.keys(combineRequestAttributes).forEach(function (attribute) {
			if (Array.isArray(combineRequestAttributes[attribute])) {
				combineRequestAttributes[attribute] = combineRequestAttributes[attribute].join(" ");
				var attributeGr = new GlideRecord("sys_one_extend_definition_attribute");
				attributeGr.addActiveQuery();
				attributeGr.addQuery("capability", capabilityId);
				attributeGr.addQuery("name", attribute);
				attributeGr.query();
				if (attributeGr.next()) {
					if (attributeGr.getValue("data_type").includes("json")) {
						var attributePromptTemplate = attributeGr.getValue("attribute_label");
						var keys = [];
						if (!attributePromptTemplate) {
							keys = ["{{" + attribute + ".all_remaining_attributes}}"];
						} else {
							keys = attributePromptTemplate.match(/{{[^}]+}}/g);
						}
						var attributeJSON = {};
						for (var i in keys) {
							keys[i] = keys[i].substring(2, keys[i].length - 2);
							keys[i] = keys[i].split(".")[1];
							if (i == 0) {
								attributeJSON[keys[i]] = combineRequestAttributes[attribute];
							} else {
								attributeJSON[keys[i]] = "";
							}
						}

						if (attributeGr.getValue("data_type") === "json_array") {
							attributeJSON = [attributeJSON];
						}

						combineRequestAttributes[attribute] = attributeJSON;
					}
				}
			}
		});

		return combineRequestAttributes;
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
		return true;
	},

    type: 'GenAILargeInputPostprocessor'
};
