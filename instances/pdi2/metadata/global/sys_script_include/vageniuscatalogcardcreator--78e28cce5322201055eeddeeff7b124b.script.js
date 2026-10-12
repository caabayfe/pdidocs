var VAGeniusCatalogCardCreator = Class.create();
VAGeniusCatalogCardCreator.prototype = Object.extendsObject(global.VAGeniusCardCreator, {
	
	initialize: function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index) {
		VAGeniusCardCreator.prototype.initialize.call(
			this, searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, 'CatalogCard', index);
	},
	
	preProcess: function() {
		
		var externalUrl = this.getActionUrl().trim();
		
		var linkHref = !gs.nil(externalUrl) ? this.getMetricsURL(externalUrl) : 
			this.getMetricsURL(
				this.VA_SYSTEM.applyLinkTemplate(this.getSysId(), this.getTableName(), this.getActionName())
			);

		this.setData('linkHref', linkHref);
		this.setData('alt', GlideStringUtil.escapeHTML(
			gs.getMessage('Image of {0}', this.getModel()['columns.name'])));

		// Set default icon if the catalog item does not have any
		if (gs.nil(this.CARD_DATA.image)) {
			this.LOGGER.info('Sending default cart icon because catalog item does not have an image');
			this.setData('image', 'default-cart-icon.svg');
		}
	},

    type: 'VAGeniusCatalogCardCreator'
});
