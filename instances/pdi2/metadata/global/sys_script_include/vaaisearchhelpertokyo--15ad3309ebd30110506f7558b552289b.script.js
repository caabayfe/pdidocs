var VAAISearchHelperTokyo = Class.create();

VAAISearchHelperTokyo.REGULAR_SEARCH_DISPLAY_MAX_LIMIT = 3;
VAAISearchHelperTokyo.GENIUS_SEARCH_DISPLAY_MAX_LIMIT = 1;

VAAISearchHelperTokyo.filterResultsForLoggedInUser = function(searchResults, vaSystem, loggingContext) {
	return VAAISearchHelper.filterResultsForLoggedInUser(searchResults, vaSystem, loggingContext);
};

VAAISearchHelperTokyo.isSearchSuccessful = function(searchResults) {
	return VAAISearchHelper.isSearchSuccessful(searchResults);
};

VAAISearchHelperTokyo.processResults = function(searchResults, vaSystem, vaInputs, vaVars) {

	var results =  JSON.parse(searchResults);
	vaSystem.setAtlasSearchPerformed();

	var result = results.result[0];

	var executionResult = result.executionResult;

	var geniusSearchResults = null;
	var nonGeniusResults = null;

	var searchMetadata = {};
	searchMetadata.click_metrics = {};
	searchMetadata.glide_signals = executionResult.searchMetadata;
	
	// adding user_id and session_id to pass around user_id and session_id 
	// until the end of the flow for glide-signals's event tracking.
	searchMetadata.is_logged_in = vaVars.is_logged_in;
	searchMetadata.user_id = vaVars.user_id;
	searchMetadata.session_id = vaVars.session_id;

	var anyGeniusResults = executionResult.geniusResultsTemplates.items.length > 0;
	if (anyGeniusResults)
		geniusSearchResults = executionResult.geniusResultsTemplates.items[0];

	var items = executionResult.searchResultsTemplates.items.slice(0, VAAISearchHelperTokyo.REGULAR_SEARCH_DISPLAY_MAX_LIMIT);
	
	if (items.length > 0)
		nonGeniusResults = items;

	searchMetadata.search_id = VAClickMetrics.createGUID();
	searchMetadata.search_result_count
		= executionResult.geniusResultsTemplates.items.length + executionResult.searchResultsTemplates.items.length;

	// the time taken reported by the payload.
	searchMetadata.execution_time = result.executionTime;

	// process the search result metrics.
	VAAISearchHelperTokyo.processSearchResultMetrics(searchMetadata, geniusSearchResults, nonGeniusResults, vaSystem, vaInputs, vaVars);

	var searchMetadataStr = !gs.nil(searchMetadata) ? JSON.stringify(searchMetadata) : null ;
	var geniusResultsStr = !gs.nil(geniusSearchResults) ? JSON.stringify(geniusSearchResults) : null ;
	var nonGeniusResultsStr = !gs.nil(nonGeniusResults) ? JSON.stringify(nonGeniusResults) : null;

	return {
		searchMetadata: searchMetadataStr,
		geniusSearchResults: geniusResultsStr,
		searchResults: nonGeniusResultsStr
	};
};

/**
* Collects search results metrics and sends them out for relevancy training and VA dashboard
*/
VAAISearchHelperTokyo.processSearchResultMetrics = function(searchMetadata, geniusSearchResults, regularSearchResults, vaSystem, vaInputs, vaVars) {

	// check if AI search click metrics is enabled or not.
	if (!global.VAClickMetrics.isAISearchClickMetricsAllowed())
		return {};

	// handle genius search results.
	var collector = new global.VAAISearchEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);

	if (!gs.nil(geniusSearchResults))
		collector.collect(global.AISearchConstants.RESULT_TYPE_GENIUS, geniusSearchResults);

	if (!gs.nil(regularSearchResults)) {
		// handle regular search results.
		var maxResults = global.VAAISearchHelperTokyo.getRegularSearchDisplaySize(regularSearchResults);

		for(i = 0; i < maxResults && i < regularSearchResults.length; i++)
			collector.collect(global.AISearchConstants.RESULT_TYPE_SEARCH, regularSearchResults[i]);
	}
    
	collector.sendOutMetrics();

	//returns the payload for verification
	return collector.getPayload();
};

VAAISearchHelperTokyo.shouldDisplayGeniusResult = function(geniusSearchResults, loggingContext) {
	return VAAISearchHelper.shouldDisplayGeniusResult(geniusSearchResults, loggingContext);
};

VAAISearchHelperTokyo.generateGeniusCardResponse = function(searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, dynamicChoiceNodeName) {
	var metadata = JSON.parse(searchMetadata);
	var searchResponse = JSON.parse(geniusSearchResults);
	var index = 0;
	VAAISearchHelperTokyo.getLogger(vaVars.loggingContext).info('Generating genius result');

	var cardCreator = global.VASearchCardCreatorFactoryTokyo.getCreator(metadata, searchResponse, vaSystem, vaInputs, vaVars, index, dynamicChoiceNodeName);

	// check if providing url
	if (!gs.nil(searchResponse.auto_resolution_url))
		cardCreator.setURL(searchResponse.auto_resolution_url);

	return cardCreator.createCard();
};

VAAISearchHelperTokyo.generateSearchResultsResponse = function(searchMetadata, searchResults, header, vaSystem, vaInputs, vaVars, dynamicChoiceNodeName) {
	var logger = VAAISearchHelperTokyo.getLogger(vaVars.loggingContext);
	logger.info('Generating search result response');
	try {
		var metadata = JSON.parse(searchMetadata);
		var response = JSON.parse(searchResults);

		var groupedLinksOutMsg = new sn_cs.GroupedPartsOutMsg();
		groupedLinksOutMsg.setHeader(header);

		// Only show first three search results - GroupedPartsOutMsg is limited to 3
		var maxResults = VAAISearchHelperTokyo.getRegularSearchDisplaySize(response);

		for (i = 0; i < maxResults; i++) {

			var searchResult = response[i];
			var propValues = searchResult.propValues;
			var model = propValues.model;
			var url = "";

			// able to provide url to override
			if (!gs.nil(searchResult.auto_resolution_url)) {
				url = searchResult.auto_resolution_url;
			}

			if (gs.nil(url)) {

				if (!gs.nil(propValues.clickAction) && !gs.nil(propValues.clickAction.actionPayload)) {
					var actionName = propValues.clickAction.name;
					var actionPayload = propValues.clickAction.actionPayload;
					url = !gs.nil(actionPayload.url) ? actionPayload.url : VAAISearchHelperTokyo.createURLByActionPayload(actionPayload.table, actionPayload.sysId, actionName, vaSystem, true, dynamicChoiceNodeName);
				}
				else
					url = VAAISearchHelperTokyo.createURLByModel(model.table, model.sysId, vaSystem, true, dynamicChoiceNodeName);
			}

			// create a click metrics URL.
			url = global.VAAISearchClickMetricsURLHelper.createSearchResultEventMetricsURL(metadata, searchResult, vaSystem, vaInputs, vaVars, url, i);

			var context = VAAISearchHelperTokyo.buildSearchContext(propValues);
			var title = VAAISearchHelperTokyo.buildSearchTitle(propValues);
			var description = propValues.description;
			logger.debug('Adding search result to response: title={0}, url={1}, description={2}, context={3}',
				title, url, description, context);

			groupedLinksOutMsg.addLinkPart(title, url, description, context);
		}
		return groupedLinksOutMsg;
	} catch(ex) {
		logger.error('VAAISearchHelperTokyo: Error generating search response: {0}', ex);
		// Return any links that have been successfully generated
		return groupedLinksOutMsg;
	}
};

VAAISearchHelperTokyo.createURLByActionPayload = function(table, sysId, actionName, vaSystem, isRegularResults, dynamicChoiceNodeName) {
	if (global.VAAISearchHelperTokyo.shouldUseSeismicPopup(table, sysId, isRegularResults))
		return global.VAAISearchHelperTokyo.createSeismicPopupURL(sysId, vaSystem, dynamicChoiceNodeName);

	return vaSystem.applyLinkTemplate(sysId, table, actionName);
};

VAAISearchHelperTokyo.createURLByModel = function(table, sysId, vaSystem, isRegularResults, dynamicChoiceNodeName) {
	if (global.VAAISearchHelperTokyo.shouldUseSeismicPopup(table, sysId, isRegularResults))
		return global.VAAISearchHelperTokyo.createSeismicPopupURL(sysId, vaSystem, dynamicChoiceNodeName);

	return vaSystem.applyLinkTemplate(sysId, table);
};

VAAISearchHelperTokyo.shouldUseSeismicPopup = function(table, sysId, isRegularResults) {
	var shouldUseSeismicPopup = false;
    var isCatalogSupported = new sn_sc.CatalogConversationHelper().getConversationalRenderType(sysId, true);

	if (table == "sc_cat_item" && (isCatalogSupported == "popup-seismic" || isCatalogSupported == "conversation"))
		shouldUseSeismicPopup = true;

	return shouldUseSeismicPopup;
};

VAAISearchHelperTokyo.createSeismicPopupURL = function(sysId, vaSystem, dynamicChoiceNodeName) {
	var requestedFor = gs.getUserID();
    var sessionId = vaSystem.getSessionIdOnConversation();
	var conversationId = vaSystem.getConversationId();
	var taskId = vaSystem.getConversationTaskId();
	var baseUrl = gs.getProperty('glide.servlet.uri');

	var seismicUrl = baseUrl + "now/virtual-agent/content/catalog/" + sysId + "/" + requestedFor + "/" + conversationId + "/" + taskId + "/" + sessionId + "/" + dynamicChoiceNodeName;
	if(!gs.isLoggedIn())
        seismicUrl += "/params/guestSessionIdentifier/"+ vaSystem.getGuestSessionIdentifier();
	seismicUrl+= "/?referrer=popup&engagement_channel=va";

	return seismicUrl;
};

// Create a context using the EVAM convention
VAAISearchHelperTokyo.buildSearchContext = function(props){
	var contextParts = [];
	var contextFields = [
		'contextEmoji',
		'contextSeparator1',
		'context1',
		'contextSeparator2',
		'context2',
		'contextSeparator3',
		'context3'
	];

	for (var i in contextFields) {
		var contextField = contextFields[i];
		var contextFieldValue = props[contextField];
		if (!gs.nil(contextFieldValue))
			contextParts.push(contextFieldValue);
	}

	var context = contextParts.join(' ');
	return VAAISearchHelperTokyo.stripHighlightTags(context);
};

VAAISearchHelperTokyo.buildSearchTitle = function(props) {
	var titleParts = [];
	var titleFields = [
		"titleEmoji",
		"title"
	];

	for (var i in titleFields) {
		var titleField = titleFields[i];
		var titleFieldValue = props[titleField];
		if (!gs.nil(titleFieldValue))
			titleParts.push(titleFieldValue);
	}
	var title = titleParts.join(" ");

	return VAAISearchHelperTokyo.stripHighlightTags(title);
};

VAAISearchHelperTokyo.stripHighlightTags = function(text) {
	return global.VAAISearchHelper.stripHighlightTags(text);
};

VAAISearchHelperTokyo.doesSearchResultsHaveItems = function(searchResults) {
	if (gs.nil(searchResults))
		return false;
	var results = JSON.parse(searchResults);
	var executionResult = results.result[0].executionResult;
	var geniusResultItems = executionResult.geniusResultsTemplates.items;
	var searchResultItems = executionResult.searchResultsTemplates.items;
	return geniusResultItems.length > 0 || searchResultItems.length > 0;
};

/**
* Returns the display size for the regular search response.
* @param results : regular search results
* @return the allowed max search result number to display.
*/
VAAISearchHelperTokyo.getRegularSearchDisplaySize = function(results) {
	//Only show first three search results - GroupedPartsOutMsg is limited to 3
	var resultSize = gs.nil(results)? 0 : results.length;
	return Math.min(resultSize, VAAISearchHelperTokyo.REGULAR_SEARCH_DISPLAY_MAX_LIMIT);
};

/**
* Returns the search application configuration Id found by search profile Id.
* @param profileId : the search profile Id. null is not allowed.
* @return the found search configuration id. null if not found.
*/
VAAISearchHelperTokyo.getSearchApplicationConfigurationIdBySearchProfileId = function(profileId) {
	return VAAISearchHelper.getSearchApplicationConfigurationIdBySearchProfileId(profileId);
};

VAAISearchHelperTokyo.isSearchEnabled = function(loggingContext) {
	var logger = VAAISearchHelperTokyo.getLogger(loggingContext);
	var api = new sn_ais.StatusApi();

	if (!api.isAisEnabled()){
		logger.warn('AI Search is not enabled');
		return false;
	}

	return true;
};

/**
 * Creates a ScriptableGlideLogger instance with the passed context or creates a context using vaSystem
 * @param vaSystem
 * @param context
 * @returns {sn_log.GlideLogger}
 */
VAAISearchHelperTokyo.getLogger = function(context) {
	if (typeof context === 'string')
		context = JSON.parse(context);

	var context = context || global.VAAISearchHelperTokyo.getLoggingContext();
	return new sn_log.GlideLogger('sn_cs.ai_search', context, Object.keys(context));
};

/**
 * Creates a context map to be used by AI Search loggers
 * @param vaSystem
 * @returns {{app: string, track: string}}
 */
VAAISearchHelperTokyo.getLoggingContext = function(vaSystem) {
	return global.VAAISearchHelper.getLoggingContext(vaSystem);
};
