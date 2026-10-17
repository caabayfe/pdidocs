var VAGeniusCatalogCardCreatorTokyo = Class.create();
VAGeniusCatalogCardCreatorTokyo.prototype = Object.extendsObject(global.VAGeniusCardCreatorTokyo, {
	
	initialize: function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index, cardType, dynamicChoiceNodeName) {
		VAGeniusCardCreatorTokyo.prototype.initialize.call(
			this, searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, cardType, index, dynamicChoiceNodeName);
	},
	
	preProcess: function() {
		var externalUrl = this.getActionUrl().trim();

		if (!gs.nil(externalUrl))
			this.setURL(externalUrl);

		this.setData('linkHref', this.getMetricsURL());
		this.setData('alt', GlideStringUtil.escapeHTML(
			gs.getMessage('Image of {0}', this.getModel()['columns.name'])));

		// Set default icon if the catalog item does not have any
		if (gs.nil(this.CARD_DATA.image)) {
			this.LOGGER.info('Sending default cart icon because catalog item does not have an image');
			this.setData('image', 'default-cart-icon.svg');
		}

		var catalogSysId = this.getSysId();
        var isConversationalCatalog = new sn_sc.CatalogConversationHelper().getConversationalRenderType(catalogSysId, true);
        if (isConversationalCatalog == "conversation") {
			delete this.CARD_DATA["linkLabel"];
			delete this.CARD_DATA["linkHref"];
		}
	},

    type: 'VAGeniusCatalogCardCreatorTokyo'
});
