var ContentTypeValidator = Class.create();
ContentTypeValidator.prototype = {
	
	defaultSupportedContentTypes: "image/svg+xml",
	
	initialize: function() {},
	
	isValidType: function(attachment /*GlideRecord*/, userDefinedSupportedContentTypes /*Array*/) {
			if (gs.nil(attachment)) {
				return false;
			}
			
			var contentType = attachment.getValue("content_type");

			if (gs.nil(userDefinedSupportedContentTypes) || !Array.isArray(userDefinedSupportedContentTypes)) {
				userDefinedSupportedContentTypes = this.defaultSupportedContentTypes;
			}
			
			if (userDefinedSupportedContentTypes.indexOf(contentType) == -1) {
				return false;
			}

			return true;
		}
};
