var VAAISearchHelperYokohama = Class.create();

/**
 * Generates Genius result card response
 */
VAAISearchHelperYokohama.generateGeniusCardResponse = function(searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName) {
	var logger = global.VAAISearchHelperTokyo.getLogger(vaVars.loggingContext);

	try {
		return global.VAAISearchHelperYokohama.generateSearchCardResponse(
			global.AISearchConstants.RESULT_TYPE_GENIUS, searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName, 0);
	} catch (ex) {
		logger.error('VAAISearchHelperYokohama: Error generating genius card response: {0}', ex);
		return "";
	}
};

VAAISearchHelperYokohama.generateSearchCardResponse = function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName, order) {
	var metadata = JSON.parse(searchMetadata);
	var searchResponse = JSON.parse(searchResults);

	global.VAAISearchHelperTokyo.getLogger(vaVars.loggingContext).info('VAAISearchHelperYokohama: Generating search result - result type:{0}', resultType);

	var cardCreator = global.VASearchCardCreatorFactoryYokohama.getCreator(resultType, metadata, searchResponse, vaSystem, vaInputs, vaVars, vaContext, order, dynamicChoiceNodeName);

	// Special case for IAR
	if (!gs.nil(searchResponse.auto_resolution_url))
		cardCreator.setURL(searchResponse.auto_resolution_url);

	return cardCreator.createCard();
};

VAAISearchHelperYokohama.createCatItemContentURL = function(sysId, logger) {
	logger.debug("VAAISearchHelperYokohama: Determining URL for catalog content item: {0}", sysId);
	var startTime = new Date().getTime();
	
	try {
		var gr = new GlideRecord("sc_cat_item_content");
		gr.addQuery("sys_id", sysId);
		gr.query();
		if (gr.next()) {
			
			var api = new global.GlobalGlideappCatalogURLGenerator();
			var url = api.getItemBaseURLFromGR(gr).toString();
			
			var endTime = new Date().getTime();
			logger.debug("VAAISearchHelperYokohama: Took {0} ms to determine URL for catalog content item: {1}", endTime - startTime, sysId);
			
			return url;
		}
	} catch (e) {
		logger.warn("VAAISearchHelperYokohama: Error determining URL for catalog content item: " + sysId + ". Error is: " + e.toString());
		return null;
	}

	return null;
};
