var EmAiAlertProxy = Class.create();
EmAiAlertProxy.prototype = {
    initialize: function() {
    },

	sanitizeHtml: function(content){
		return SNC.GlideHTMLSanitizer.sanitize(content);
	},

    type: 'EmAiAlertProxy'
};
