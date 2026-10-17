var CustomPreAuthProperties = Class.create();
CustomPreAuthProperties.prototype = {
    initialize: function() {
    },

	/**
	 * Returns a JSON object keyed by the custom property names.
	 */
    getProperties: function(input) {
        return {"my_test_property": "test_property_value"};
    },

    type: 'CustomPreAuthProperties'
};
