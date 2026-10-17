var AISearchRetrieveSearchResultsWrapper = Class.create();
AISearchRetrieveSearchResultsWrapper.prototype = {
    initialize: function() {},

    retrieveSearchResults: function(searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, grConfigFilter, searchResultType) {
		
        var logger = global.VAAISearchHelperTokyo.getLogger(loggingContext);
        if (gs.nil(searchTerm)) {
            logger.error("Starting retrieveSearchResults with empty searchTerm");
        }
		var logMsg = "contextProfileId: "+contextProfileId+", searchContextId: "+searchContextId+", loggingContext: "+loggingContext+", locale: " 
						+locale+", additionalContext: "+additionalContext+", grConfigFilter:"+ JSON.stringify(grConfigFilter) + ", searchResultType:" + searchResultType;

        logger.debug("Starting retrieveSearchResults for "+logMsg);
        return sn_cs.VASystemObject.retrieveSearchResults(searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, grConfigFilter, searchResultType);
    },

	retrieveSearchResultsAsync: function(callbackId, searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, grConfigFilter, searchResultType, conversationId, queryMode) {
		var tracer = new VATraceObjectBuilder().withConversationId(conversationId).build();
		tracer.startEvent('AISearchRetrieveSearchResultsWrapper.retrieveSearchResultsAsync', 'Invoking search retrieval java apis');
		var logger = global.VAAISearchHelperTokyo.getLogger(loggingContext);

		try {
			var api = new sn_nowassist_va.NowAssistRetrieveSearchResults();
			var result = api.retrieveSearchResultsAsync(callbackId, searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, grConfigFilter, searchResultType, conversationId, queryMode);
			tracer.endEvent('AISearchRetrieveSearchResultsWrapper.retrieveSearchResultsAsync');
			tracer.startEvent('WAIT_FOR_SEARCH_CALLBACK');

			return result;
		} catch (e){
			if (e instanceof TypeError){
				// If NowAssistRetrieveSearchResults does not exist, fallback to Aug compatible code
				logger.info('Type error when running NowAssistRetrieveSearchResults.retrieveSearchResultsAsync(), falling back to August store app compatible code. Error: '+ e.toString());

				if (gs.nil(searchTerm))
					logger.warn("Starting retrieveSearchResultsAsync with empty searchTerm");

				var logMsg = "contextProfileId:" + contextProfileId + ", searchContextId:" + searchContextId + ", loggingContext:" + loggingContext + ", locale:" + locale +
					", additionalContext:" + additionalContext + ", grConfigFilter:" + JSON.stringify(grConfigFilter) + ", searchResultType:" + searchResultType;
				logger.debug("Starting retrieveSearchResultsAsync for " + logMsg);

				return sn_cs.VASystemObject.retrieveSearchResultsAsync(callbackId, searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, grConfigFilter, searchResultType);
			}
			else 
				logger.error('Error while running retrieveSearchResultsAsync. Error: ' + e.toString());
		}
	},

    retrieveSearchResultsMultipleCallbacks: function(callbackId, searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, conversationId, grConfigFilter, searchResultType) {
        var api = new sn_nowassist_va.NowAssistRetrieveSearchResults();
        return api.retrieveSearchResultsMultipleCallbacks(callbackId, searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, conversationId, grConfigFilter, searchResultType);
    },

    retrieveSemanticSearchResults: function(searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext) {
        var logger = global.VAAISearchHelperTokyo.getLogger(loggingContext);
        if (gs.nil(searchTerm)) {
            logger.error("Starting retrieveSemanticSearchResults with empty searchTerm");
        }
        logger.debug("Starting retrieveSemanticSearchResults for contextProfileId: {0}, searchContextId: {1}, loggingContext: {2}, locale: {3}, additionalContext: {4}", contextProfileId, searchContextId, loggingContext, locale, additionalContext);
        return sn_cs.VASystemObject.retrieveSemanticSearchResults(searchTerm, contextProfileId, searchContextId, loggingContext,
            locale, additionalContext);
    },

    type: 'AISearchRetrieveSearchResultsWrapper'
};
