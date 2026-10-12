var SecureTokenGenerator = Class.create();
SecureTokenGenerator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	generateSecureToken: function() {
		var secureRandom = GlideSecureRandomUtil;
		return secureRandom.getSecureRandomString(20);
	},

    type: 'SecureTokenGenerator'
});
