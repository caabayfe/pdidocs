var VASearchUserCardCreatorUtah = Class.create();
VASearchUserCardCreatorUtah.prototype = Object.extendsObject(global.VASearchCardCreatorUtah, {

	initialize: function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardType, dynamicChoiceNodeName) {
		VASearchCardCreatorUtah.prototype.initialize.call(
			this, reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, cardType, index, dynamicChoiceNodeName);
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

    type: 'VASearchUserCardCreatorUtah'
});
