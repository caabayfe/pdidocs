var VASearchCardCreatorUtah = Class.create();
VASearchCardCreatorUtah.prototype = Object.extendsObject(global.VAGeniusCardCreatorTokyo, {
	
	// from utah, this card is for genius search result and regular search result
	resultType:null,
	
	initialize: function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, type, index, dynamicChoiceNodeName) {
		
		VAGeniusCardCreatorTokyo.prototype.initialize.call(
			this,searchMetadata, searchResults, vaSystem, vaInputs, vaVars, type, index, dynamicChoiceNodeName);
		
		this.resultType = resultType;
	},

	getOriginalURL : function() {
		// if we didn't set url previously, generate it here
		if (gs.nil(this.originalURL))
			this.originalURL = VAAISearchHelperTokyo.createURLByActionPayload(this.getTableName(), this.getSysId(), this.getActionName(), this.VA_SYSTEM, false, this.DYNAMIC_CHOICE_NODE_NAME);
		
		return this.originalURL;
	},

	/**
	 * Returns the click metrics URL for the given search type.
	 */
	getMetricsURL: function() {

		var originalURL = this.getOriginalURL();

		return VAAISearchClickMetricsURLHelper.createResultEventMetricsURL(
			this.resultType, this.SEARCH_META_DATA, this.GENIUS_RESULTS, this.VA_SYSTEM, 
				this.VA_INPUTS, this.VA_VARS, originalURL, this.index);
	},

    type: 'VASearchCardCreatorUtah'
});
