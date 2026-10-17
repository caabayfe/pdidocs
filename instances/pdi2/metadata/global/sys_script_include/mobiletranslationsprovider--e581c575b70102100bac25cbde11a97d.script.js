var MobileTranslationsProvider = Class.create();
MobileTranslationsProvider.prototype = Object.extendsObject(AbstractMobileCallableInclude, {
	getMessage: function() {
		var key = this.getParameter("key");
		return sn_i18n.Message.getMessage("", key);
	},

    type: 'MobileTranslationsProvider'
});
