var AutoResolutionAISearchHelper = Class.create();

/**
* Returns the result found by context Id
* @param contextId Auto-Resolution context Id
* @param geniusSearchMaxLimit the max limit for Genius search optional.
* @param searchMaxLimit the max limit for regular search. optional.
* @return the results found by the context Id. null if not found.
*/
AutoResolutionAISearchHelper.getSearchResultByContextId = function(contextId, geniusSearchMaxLimit, searchMaxLimit) {
	var searchResult = AutoResolutionAISearchResult.getByContextId(contextId);
	
	// if the search result is null, return null.
	if(gs.nil(searchResult))
		return null;
	
	// enforce the max limits if provided from outside.
	if (!gs.nil(geniusSearchMaxLimit)) 
		searchResult.setGeniusSearchMaxLimit(geniusSearchMaxLimit);
	
	if (!gs.nil(searchMaxLimit))
		searchResult.setSearchMaxLimit(searchMaxLimit);
	
	return searchResult;
};

/**
* Returns the available values for the positive feedbacks. The values come from choice list.
* @return [{value:'<value>', lable:'<lable>, sequence:<sequence>'}]
*/
AutoResolutionAISearchHelper.getAvailablePositiveFeedbackValues = function() {
	return AutoResolutionAISearchResultLineItem.getAvailablePositiveFeedbackValues();
};

/**
* Returns the available values for the negative feedbacks. The values come from choice list.
* @return [{value:'<value>', lable:'<lable>, sequence:<sequence>'}]
*/
AutoResolutionAISearchHelper.getAvailableNegativeFeedbackValues = function() {
	return AutoResolutionAISearchResultLineItem.getAvailableNegativeFeedbackValues();
};

/**
* Returns the available result status. The values come from choice list.
* @return [{value:'<value>', lable:'<lable>, sequence:<sequence>'}]
*/
AutoResolutionAISearchHelper.getAvailableResultStatus = function() {
	return AutoResolutionAISearchResultLineItem.getAvailableResultStatus();
};

/**
* Updates the result status of the line item.  
*/
AutoResolutionAISearchHelper.updateResultLineItemResultStatus = function(lineItemSysId, resultStatus) {
	// if the sysId should not be null.
	if (gs.nil(lineItemSysId))
		return null;
	
	var lineItem = new AutoResolutionAISearchResultLineItem(lineItemSysId);
	lineItem.setResultStatus(resultStatus);
	lineItem.update();
};

/**
* Updates the specific result line item with the feedback and sets the Feedback provider to be the current session user.
*
* @param lineItemSysId AISearchResultLineItem sysId
* @param feedbackType - either positive or negative
* @param feedbackValue - It should be one of the positive or negative feedback values
* @param processFeedbacks - If omitted or false, feedback won't be processed. Instead, processFeedbacks method needs to be called explicitly. 
*.                          If true is passed, this feedback will be processed.
*/
AutoResolutionAISearchHelper.updateResultLineItemFeedback = function(lineItemSysId, feedbackType, feedbackValue, processFeedbacks) {

	// if the sysId should not be null.
	if (gs.nil(lineItemSysId))
		return null;

	var lineItem = new AutoResolutionAISearchResultLineItem(lineItemSysId);
	lineItem.setFeedback(feedbackType, feedbackValue);
	lineItem.setFeedbackProviderPersona(AutoResolutionAISearchResultLineItem.FEEDBACK_PROVIDER_PERSONA_REQUESTER);
	lineItem.setFeedbackProvider(gs.getUserID());
	lineItem.update();
	
	// call the result.
	if (processFeedbacks)
		AutoResolutionAISearchHelper.processFeedbacks(lineItem.getAISearchResultId());
};

/**
* All unsubmitted feedback will be collected and submitted to GlideSignals API. This is for batching.
* @param AISearchResult sysId
*/
AutoResolutionAISearchHelper.processFeedbacks = function(resultSysId) {
	var result = new AutoResolutionAISearchResult(resultSysId);
	result.processFeedbacks();
};

/**
* Updates the multiple feedbacks at once. After this call, only one event will be fired.
* @param resultLineItemSysIds an array of sys_ids of AI Search result line items.
* @param feedbackType This can be either 'positive' or 'negative'
* @param feedbackValue It can be one of the predefined values for positive or negative values.
*/
AutoResolutionAISearchHelper.updateMultipleResultLineItemFeedbacks = function(resultLineItemSysIds, feedbackType, feedbackValue) {
	
	for(var i=0; i<resultLineItemSysIds.length; i++) {
		var lineItemSysId = resultLineItemSysIds[i];
		AutoResolutionAISearchHelper.updateResultLineItemFeedback(lineItemSysId, feedbackType, feedbackValue, false);
	}
	
	if(!gs.nil(lineItemSysId)) {
		var lineItem = new AutoResolutionAISearchResultLineItem(lineItemSysId);
		AutoResolutionAISearchHelper.processFeedbacks(lineItem.getAISearchResultId());
	}
};

/**
* Parsed the AI search results
*/
AutoResolutionAISearchHelper.parseAISearchResults = function(searchResults, maxGeniusResultLimit, maxSearchResultLimit) {

	var results =  JSON.parse(searchResults);
	var result = results.result[0];

	var executionResult = result.executionResult;

	var geniusSearchResults = null;
	var nonGeniusResults = null;

	var searchMetadata = {};
	searchMetadata = executionResult.searchMetadata;
	
	var items = executionResult.geniusResultsTemplates.items.slice(0, maxGeniusResultLimit);
	if (items.length > 0) 
		geniusSearchResults = items;
	
	items = executionResult.searchResultsTemplates.items.slice(0, maxSearchResultLimit);
	if (items.length > 0)
		nonGeniusResults = items;

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
 * Get regular AIS result link, with iar portal configuration
 * @param contextId
 * @param resultPayload
 * @return {string}
 */
AutoResolutionAISearchHelper.getAISearchResultLink = function(contextId, resultPayload) {

	// propValues
	var sysId = AISearchHelper.getParentIdFromPropValues(resultPayload.propValues);
	var tableName = AISearchHelper.getParentTableFromPropValues(resultPayload.propValues);
	var actionName = ""; // unused in this flow
	
	// get portal from iar config
	var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
	contextGr.get(contextId);
	var configGr = contextGr.configuration.getRefRecord();
	var portalGr = configGr.portal.getRefRecord();
	var portal = portalGr.getDisplayValue("url_suffix");

	return sn_cs.VASystemObject.applyLinkTemplateCustomPortal(sysId, tableName, actionName, portal);
};

/**
 * Add IAR-specific parameters on top of regular AIS result link
 * @param aisURL
 * @param lineItemSysId
 * @return {string}
 */
AutoResolutionAISearchHelper.getIARSearchResultLink = function(aisURL, lineItemSysId) {
	// change to specific iar params (as long as the default values are already there)
	aisURL = AutoResolutionAISearchHelper._addIARToIdParam(aisURL);
	return aisURL + "&" + global.AutoResolutionConstants.RECOMMENDATION_ID_PARAM + "=" + lineItemSysId;
};

/**
 * if tableName is supported, return the url with id replaced
 * @param aisURL
 * @return string
 * @private
 */
AutoResolutionAISearchHelper._addIARToIdParam = function(aisURL) {
	if (aisURL.indexOf(AutoResolutionConstants.CATALOG_TABLE_NAME) !== -1) {
		return AutoResolutionAISearchHelper._replaceIdParam(aisURL,
			AutoResolutionConstants.CATALOG_TABLE_NAME, AutoResolutionConstants.IAR_CATALOG_TABLE_NAME);
	}
	else if (aisURL.indexOf(AutoResolutionConstants.KB_ARTICLE_TABLE_NAME) !== -1) {
		return AutoResolutionAISearchHelper._replaceIdParam(aisURL,
			AutoResolutionConstants.KB_ARTICLE_TABLE_NAME, AutoResolutionConstants.IAR_KB_ARTICLE_TABLE_NAME);
	}
	else return aisURL;
};

/**
 * replace id param in url with idReplaceValue
 * @param url
 * @param idSource
 * @param idReplaceValue
 * @return {string}
 * @private
 */
AutoResolutionAISearchHelper._replaceIdParam = function(url, idSource, idReplaceValue) {
	var paramToReplaceRegEx = new RegExp("([?&]id=)([\\w-]*)" + idSource + "([\\w-]*)(&|$)");
	return url.replace(paramToReplaceRegEx, "$1" + idReplaceValue + "$4");
};

/**
 * Takes in results that have been processed by VAAISearchHelperTokyo.processResults
 * and adds iar-specific field onto those results
 * 
 * @param arResult : AutoResolutionAISearchResult
 * @param processedResults
 */
AutoResolutionAISearchHelper.formatResultsForIAR = function(arResult, processedResults) {
	
	var formattedResults = {};
	
	// genius result
	var geniusResult = "";
	var geniusResultLineItems = arResult.getGeniusSearchResults(); // returns array of genius results, empty array if no results
	if (!gs.nil(processedResults.geniusSearchResults) && geniusResultLineItems.length !== 0) {
		geniusResult = JSON.parse(processedResults.geniusSearchResults);

		var index = 0; // currently only supporting 1 genius result
		geniusResult.auto_resolution_url = AutoResolutionAISearchResultLineItem.getRecommendationURL(geniusResultLineItems[index]);
		geniusResult.auto_resolution_line_item_sys_id = geniusResultLineItems[index].getSysId();

		formattedResults.geniusSearchResult = JSON.stringify(geniusResult);
	}

	// regular search results
	var searchResults = [];
	var searchResultLineItems = arResult.getSearchResults();
	var maxResults = VAAISearchHelperTokyo.getRegularSearchDisplaySize(searchResultLineItems);
	var processedSearchResults = JSON.parse(processedResults.searchResults);

	
	for (var i = 0; i < maxResults; i++) {
		var processedSearchResult = processedSearchResults[i];
		
		// processedSearchResult and searchResultLineItems might be out of sync
		var searchResultLineItem = null;
		try {
			var resultSysId = processedSearchResult.propValues.model.sys_id;
			searchResultLineItem = _getLineItemForSysId(resultSysId, searchResultLineItems);
		} catch(error) {
			gs.info('Error getting search result line item for sys_id: ' + resultSysId + '. Error: ' + error);
		}

		var currentSearchResultLineItem = !gs.nil(searchResultLineItem) ? searchResultLineItem : searchResultLineItems[i];
		processedSearchResult.auto_resolution_url = AutoResolutionAISearchResultLineItem.getRecommendationURL(currentSearchResultLineItem);
		processedSearchResult.auto_resolution_line_item_sys_id = currentSearchResultLineItem.getSysId();

		searchResults.push(processedSearchResult);
	}

	formattedResults.searchResults = JSON.stringify(searchResults);
	
	// metadata don't change
	formattedResults.searchMetadata = processedResults.searchMetadata;
	
	return formattedResults;
};

/**
* Returns the predicted values found by contextId
* @param contextId: AR context Id
*/ 
AutoResolutionAISearchHelper.getPredictedResultsByContextId = function(contextId) {
	
	var rtn = {predicted_language:'', predicted_criticality:'', predicted_search_query:''};
	
	var gr  = new GlideRecord('sys_cs_auto_resolution_prediction');
	if (gr.addQuery('ar_context', contextId)) {
		rtn.predicted_language =  ensureValue(gr.getValue('predicted_language'));
		rtn.predicted_search_query =  ensureValue(gr.getValue('predicted_search_query'));
		rtn.predicted_criticality =  ensureValue(gr.getValue('predicted_criticality'));
	}
	
	return rtn;
};

/**
* Returns the language that needs to be used for AISearch
*/
AutoResolutionAISearchHelper.getLanguageForAISearch = function(contextGr) {

	// look for the predicted language first.
	var prediction = contextGr.prediction;
		
	// if available, use the predicted language.
	if (!gs.nil(prediction) || !gs.nil(prediction.predicted_language))
		return prediction.predicted_language.getValue();
	
	// if the language is not found, use the user's prefered language.
	var user = contextGr.notification_user;
	
	if (!gs.nil(user) && !gs.nil(user.preferred_language)) 
		return user.preferred_language.getValue();
	
	// still not found, use the sytem default. 
	return gs.getSession().getLanguage();
};

/**
* Returns the locale that needs to be used for AISearch
*/
AutoResolutionAISearchHelper.getLocaleForAISearch = function(contextGr) {

	return ''; // currently, the following logic is breaking AIsearch for catalog. This is a temp fix.
	
	var lang = global.AutoResolutionAISearchHelper.getLanguageForAISearch(contextGr);
	var country; 
	
	//1. check user's country
	var user = contextGr.notification_user;
	
	if (!gs.nil(user) && !gs.nil(user.country)) { 
		country = user.country.getValue();
	}
	else {
		// if user's country is not found, get the system's locale.
		var locale = gs.getProperty(global.AutoResolutionAISearchConstants.SYS_LOCALE_PROP_NAME);
		
		if (!gs.nil(locale)) {
			var index = locale.indexOf('.');
			
			if (index != -1)
				country = locale.substring(index+1);
		}
	}
	
	// if still not found, use the default.
	if (gs.nil(country))
		country = global.AutoResolutionAISearchConstants.DEFAULT_LOCALE_COUNTRY;
	
	// locale = language.COUNTRY
	return lang + '.' + country;
};

/**
* Returns a collection of parameters for GlideSignals Event. These parameters will be used for Glide Signals Event.
*
* @param resultGr : GlideRecord of sys_cs_auto_resolution_ai_search_result
*/
AutoResolutionAISearchHelper.createParamBagForGlideSignalsEvent = function(resultGr, language) {
	var paramBag = {};
	
	// this execution of the search is done on behalf of the notification user. 
	// If not found, use the current user which is most likely the system user.
    var user = resultGr.ar_context ? resultGr.ar_context.notification_user : null;
	if (!gs.nil(user))
		paramBag[global.AISearchConstants.USER_ID] = user.getValue();
	else
		paramBag[global.AISearchConstants.USER_ID] = gs.getUserID();	
	
	// session_id was randomly generated when resultGr was created
    paramBag[global.AISearchConstants.SESSION_ID] = resultGr.getValue('session_id');
	
	paramBag[global.AISearchConstants.SEARCH_PROFILE] = resultGr.getValue('search_profile');
	paramBag[global.AISearchConstants.SEARCH_CONTEXT_CONFIG_ID] = resultGr.getValue('search_app_config');
	
	paramBag[global.AISearchConstants.QUERY_TERM] = resultGr.getValue('search_term'); 
	paramBag[global.AISearchConstants.LANGUAGE] = language;
	
	return paramBag;
};

/**
* Tests if AISearch feedback handling is enabled or not.
*/
AutoResolutionAISearchHelper.isAISearchFeedbackEnabled = function() {
	var propVal = gs.getProperty(global.AutoResolutionAISearchConstants.AR_AI_SEARCH_FEEDBACK_ENABLED_PROP_NAME, 'true');
	return propVal && propVal === 'true';
};

AutoResolutionAISearchHelper.updateAISResultFeedback= function(aisId, feedbackType) {
	var ais = new AutoResolutionAISearchResult(aisId);
	ais.setFeedbackType(feedbackType);
	ais.update();
};

/**
 * Get search result info from task sys id, mainly used in email scripts
 * @param taskId
 * @return [{id, title, className, description}]
 */
AutoResolutionAISearchHelper.getRecommendationInfoFromTaskId = function(taskSysId) {
	var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
	contextGr.addQuery("task", taskSysId);
	contextGr.query();

	if (!contextGr.next())
		return [];

	var aiSearchResult = AutoResolutionAISearchHelper.getSearchResultByContextId(contextGr.getUniqueValue());
	if (gs.nil(aiSearchResult))
		return [];

	var aiSearchResultLineItems = aiSearchResult.getSearchResults();
	aiSearchResultLineItems.splice(5);

	var recommendations = [];

	for (var i = 0; i < aiSearchResultLineItems.length; i++) {
		var recommendationSysId = aiSearchResultLineItems[i].getSysId();
		var recommendationPayload = JSON.parse(aiSearchResultLineItems[i].getResultPayload());

		var recommendation = {
			"id": recommendationSysId,
			"title": GlideSPScriptable().stripHTML(recommendationPayload.propValues.title),
			"className": recommendationPayload.propValues.model.table,
			"description": GlideSPScriptable().stripHTML(recommendationPayload.propValues.description)
		};

		recommendations.push(recommendation);
	}
	return recommendations;
};

function ensureValue(val) {
	return gs.nil(val) ? '' : val;
}

function _getLineItemForSysId(sysId, searchResultLineItems) {

	if (gs.nil(sysId))
		return;

	if (gs.nil(searchResultLineItems))
		return;

	if (searchResultLineItems.length == 0)
	return;

	for (var i = 0; i < searchResultLineItems.length; i++)
		if (searchResultLineItems[i].getSysId() === sysId)
			return searchResultLineItems[i];

}
