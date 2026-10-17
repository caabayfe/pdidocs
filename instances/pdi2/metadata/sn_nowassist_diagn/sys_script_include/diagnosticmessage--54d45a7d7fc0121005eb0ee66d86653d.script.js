var DiagnosticMessage = Class.create();
DiagnosticMessage.prototype = {
    message: null,
	resolution: null,

    initialize: function(message, resolution) {
		this.message = message;
		this.resolution = resolution;
    },

    type: 'DiagnosticMessage'
};
