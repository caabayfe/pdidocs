var VASearchUserCardCreatorVancouver = Class.create();
VASearchUserCardCreatorVancouver.prototype = Object.extendsObject(global.VASearchCardCreatorVancouver, {

	initialize: function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardType, dynamicChoiceNodeName) {
		global.VASearchCardCreatorVancouver.prototype.initialize.call(
			this, resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, cardType, index, dynamicChoiceNodeName);
	},

	preProcess: function() {
		this.setData('showAsLink', 'show');
		this.setData('alt', gs.getMessage('Avatar of {0}', this.CARD_DATA.header));
		this.setData('linkHref', this.getMetricsURL());

		// Set initials if the user does not have an avatar
		if (gs.nil(this.CARD_DATA.avatar)) {
			this.LOGGER.info('Sending user initials because user does not have an avatar image');
			this.setData('initials', sn_cs.VASystemObject.getInitials(this.CARD_DATA.header));
			delete this.CARD_DATA.avatar;
		}
	},

	getTranslations: function() {
		if (this.CARD_DATA["fieldLabel1"] == "Email") {
			var fieldLabel1TranslatedTerm = gs.getMessageLang("Email", this.vaContext.getRequesterLang());
			this.setData('fieldLabel1', fieldLabel1TranslatedTerm);
		}
		if (this.CARD_DATA["fieldLabel2"] == "Phone") {
			var fieldLabel2TranslatedTerm = gs.getMessageLang("Phone", this.vaContext.getRequesterLang());
			this.setData('fieldLabel2', fieldLabel2TranslatedTerm);
		}
	},

    type: 'VASearchUserCardCreatorVancouver'
});
