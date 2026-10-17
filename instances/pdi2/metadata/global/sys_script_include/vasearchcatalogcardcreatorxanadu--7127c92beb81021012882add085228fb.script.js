var VASearchCatalogCardCreatorXanadu = Class.create();
VASearchCatalogCardCreatorXanadu.prototype = Object.extendsObject(global.VASearchCardCreatorVancouver, {

	initialize: function(reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardType, dynamicChoiceNodeName) {
		global.VASearchCardCreatorVancouver.prototype.initialize.call(
			this, reultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, cardType, index, dynamicChoiceNodeName);
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
			this.setData('image', new global.VAImageUtil(this.vaContext.deviceType).getDefaultCatItemImage(this.TYPE, this.vaContext.branding_key));
		}

		var catalogSysId = this.getSysId();
		var catalogRenderType = global.VAAISearchHelperXanadu.getConversationalRenderType(catalogSysId, this.vaContext.deviceType);
		
		if (catalogRenderType == "conversation" || catalogRenderType == "inline-seismic") {
			delete this.CARD_DATA["linkLabel"];
			delete this.CARD_DATA["linkHref"];
		}
	},

	getTranslations: function() {
		if (this.CARD_DATA["linkLabel"] == "Request this item") {
			var requestThisItemLinkLabelTranslatedTerm = gs.getMessageLang("Request this item", this.vaContext.getRequesterLang());
			this.setData('linkLabel', requestThisItemLinkLabelTranslatedTerm);
		}
		if (this.CARD_DATA["linkLabel"] == "Read more") {
			var readMoreLinkLabelTranslatedTerm = gs.getMessageLang("Read more", this.vaContext.getRequesterLang());
			this.setData('linkLabel', readMoreLinkLabelTranslatedTerm);
		}
		if (this.CARD_DATA["fieldLabel1"] == "Price") {
			var priceTranslatedTerm = gs.getMessageLang("Price", this.vaContext.getRequesterLang());
			this.setData('fieldLabel1', priceTranslatedTerm);
		}
	},

  type: 'VASearchCatalogCardCreatorXanadu'
});
