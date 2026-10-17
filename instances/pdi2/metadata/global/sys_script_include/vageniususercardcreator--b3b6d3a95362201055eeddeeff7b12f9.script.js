var VAGeniusUserCardCreator = Class.create();
VAGeniusUserCardCreator.prototype = Object.extendsObject(global.VAGeniusCardCreator, {

	initialize: function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index) {
		VAGeniusCardCreator.prototype.initialize.call(
			this, searchMetadata, geniusResults, vaSystem, vaInputs, vaVars,'PersonCard', index);
	},
	
	preProcess: function() {
		this.setData('showAsLink', 'show');
		this.setData('alt', gs.getMessage('Avatar of {0}', this.CARD_DATA.header));
		
		var url = this.getMetricsURL(this.VA_SYSTEM.applyLinkTemplate(this.getSysId(), this.getTableName()));
		this.setData('linkHref', url);

		// Set initials if the user does not have an avatar
		if (gs.nil(this.CARD_DATA.avatar)) {
			this.LOGGER.info('Sending user initials because user does not have an avatar image');
			this.setData('initials', sn_cs.VASystemObject.getInitials(this.CARD_DATA.header));
			delete this.CARD_DATA.avatar;
		}
	},

    type: 'VAGeniusUserCardCreator'
});
