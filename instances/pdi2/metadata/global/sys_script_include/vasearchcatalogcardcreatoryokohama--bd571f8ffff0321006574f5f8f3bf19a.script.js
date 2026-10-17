var VASearchCatalogCardCreatorYokohama = Class.create();
VASearchCatalogCardCreatorYokohama.prototype = Object.extendsObject(global.VASearchCatalogCardCreatorXanadu, {
	
	initialize: function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardType, dynamicChoiceNodeName) {
		global.VASearchCatalogCardCreatorXanadu.prototype.initialize.call(
			this, resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, index, cardType, dynamicChoiceNodeName);
	},

	getOriginalURL: function() {
		// if we didn't set url previously, generate it here
		if (gs.nil(this.originalURL)) {
			var sysId = this.getSysId();

			// DEF0721026: Special handling for Catalog items of type content to redirect to the content URL directly.
			var catItemContentURL = global.VAAISearchHelperYokohama.createCatItemContentURL(sysId, this.LOGGER);
			if (!gs.nil(catItemContentURL)) {
				this.LOGGER.debug("VASearchCatalogCardCreatorYokohama: Catalog item sysId: " + sysId +  " is a catalog content item, it's URL is set to: " + catItemContentURL);
				this.originalURL = catItemContentURL;
			}
			
			if (gs.nil(this.originalURL))
				this.originalURL = global.VAAISearchHelperTokyo.createURLByActionPayload(this.getTableName(), sysId, this.getActionName(), this.VA_SYSTEM, false, this.DYNAMIC_CHOICE_NODE_NAME);
		}

		return this.originalURL;
	},

    type: 'VASearchCatalogCardCreatorYokohama'
});
