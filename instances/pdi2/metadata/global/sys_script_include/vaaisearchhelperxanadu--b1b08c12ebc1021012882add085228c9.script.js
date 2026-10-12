var VAAISearchHelperXanadu = Class.create();

VAAISearchHelperXanadu.getConversationalRenderType = function(catalogId, deviceType) {
	if (typeof sn_sc.CatalogConversationHelper.get !== 'undefined') {
		return sn_sc.CatalogConversationHelper.get({channelType: deviceType}).getConversationalRenderType(catalogId, deviceType);
	}
	return new sn_sc.CatalogConversationHelper().getConversationalRenderType(catalogId, true);
};

/**
 * Generates Genius result card response
 */
VAAISearchHelperXanadu.generateGeniusCardResponse = function(searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName) {
	var logger = global.VAAISearchHelperTokyo.getLogger(vaVars.loggingContext);

	try {
		return global.VAAISearchHelperXanadu.generateSearchCardResponse(
			global.AISearchConstants.RESULT_TYPE_GENIUS, searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName, 0);
	} catch (ex) {
		logger.error('VAAISearchHelperXanadu: Error generating genius card response: {0}', ex);
		return "";
	}
};

/**
 * Generates Regular result card response
 */
VAAISearchHelperXanadu.generateSearchResultsResponse = function(searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName) {
	var logger = global.VAAISearchHelperTokyo.getLogger(vaVars.loggingContext);
	logger.info('VAAISearchHelperXanadu: Generating search result response');

	try {
		var metadata = JSON.parse(searchMetadata);
		var response = JSON.parse(searchResults);

		// Only show first three search results - GroupedPartsOutMsg is limited to 3
		var maxResults = global.VAAISearchHelperUtah.getRegularSearchDisplaySize(response);

		var userChoice = "";
		if (!gs.nil(vaVars.is_now_assist_topic) && vaVars.is_now_assist_topic.toString() == "true")
			userChoice = vaInputs.choice_regular_results_main_screen;
		else
			userChoice = vaInputs.display_options;

		for (var i = 0; i < maxResults; i++) {
			var searchResult = response[i];
			var propValues = searchResult.propValues;
			var model = propValues.model;

			if (model.sysId == userChoice) {
				var result = global.VAAISearchHelperTokyo.stripHighlightTags(JSON.stringify(searchResult));

				return global.VAAISearchHelperXanadu.generateSearchCardResponse(
					global.AISearchConstants.RESULT_TYPE_SEARCH, searchMetadata, result, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName, i);
			}
		}

		return "";
	} catch (ex) {
		logger.error('VAAISearchHelperXanadu: Error generating search response: {0}', ex);
		return "";
	}
};

VAAISearchHelperXanadu.generateSearchCardResponse = function(resultType, searchMetadata, searchResults, vaSystem, vaInputs, vaVars, vaContext, dynamicChoiceNodeName, order) {
	var metadata = JSON.parse(searchMetadata);
	var searchResponse = JSON.parse(searchResults);

	global.VAAISearchHelperTokyo.getLogger(vaVars.loggingContext).info('VAAISearchHelperXanadu: Generating search result - result type:{0}', resultType);

	var cardCreator = global.VASearchCardCreatorFactoryXanadu.getCreator(resultType, metadata, searchResponse, vaSystem, vaInputs, vaVars, vaContext, order, dynamicChoiceNodeName);

	// Special case for IAR
	if (!gs.nil(searchResponse.auto_resolution_url))
		cardCreator.setURL(searchResponse.auto_resolution_url);

	return cardCreator.createCard();
};
