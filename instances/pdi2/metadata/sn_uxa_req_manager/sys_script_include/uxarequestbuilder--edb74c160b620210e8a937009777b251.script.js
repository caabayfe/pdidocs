var UxaRequestBuilder = Class.create();

UxaRequestBuilder.prototype = {
    initialize: function() {
    },

	generateDsl: function(request) {
		const { metric, type, dataCategory } = request;

		return `${type}/${metric}`;
	},
		
	type: 'UxaRequestBuilder'
};
