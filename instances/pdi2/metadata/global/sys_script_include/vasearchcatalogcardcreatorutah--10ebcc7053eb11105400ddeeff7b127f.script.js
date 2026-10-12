var VASearchCatalogCardCreatorUtah = Class.create();
VASearchCatalogCardCreatorUtah.prototype = Object.extendsObject(global.VASearchCardCreatorUtah, {
	
	initialize: function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, index, cardType, dynamicChoiceNodeName) {
		VASearchCardCreatorUtah.prototype.initialize.call(
			this, reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, cardType, index, dynamicChoiceNodeName);
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

  type: 'VASearchCatalogCardCreatorUtah'
});
