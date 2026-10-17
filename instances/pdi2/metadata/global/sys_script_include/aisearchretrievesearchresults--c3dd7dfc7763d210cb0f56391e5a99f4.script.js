var AISearchRetrieveSearchResults = Class.create();
AISearchRetrieveSearchResults.prototype = {
    initialize: function() {},

    retrieveSearchResultsAsync: function(callbackId, searchTerm, contextProfileId, searchContextId, loggingContext, locale, additionalContext, grConfigFilter, searchResultType, conversationId, callbackMode, startTime, queryMode) {

        if (this.checkForNullInputs(callbackId, searchTerm, contextProfileId, loggingContext, startTime)) {
            //if necessary inputs are null, do not proceed
            var context = loggingContext ? loggingContext : "";
            var logger = global.VAAISearchHelperTokyo.getLogger(context);
            var logMsg = "Cannot call retrieveSearchResultsAsync as one or more necessary inputs are null. Passed inputs: " + "contextProfileId:" + contextProfileId + ", callbackId:" + callbackId + ", loggingContext:" + loggingContext + ", startTime:" + startTime + ", searchTerm:" + searchTerm;
            logger.error(logMsg);
            return {};
        }

        var context = JSON.parse(loggingContext);
        var scriptStartTime = new GlideDateTime().getNumericValue() - parseInt(startTime);
        VAAISearchHelper.getLogger(context).debug('retrieveSearchResultsAsync script started: {0}ms', scriptStartTime);

        additionalContext = additionalContext ? additionalContext : "{}";
        grConfigFilter = grConfigFilter ? grConfigFilter.toString().split(",") : [];

        var outputs = {};

        try {
            var api = new AISearchRetrieveSearchResultsWrapper();
            if (callbackMode === "multiple") {
                var searchResults = api.retrieveSearchResultsMultipleCallbacks(callbackId, searchTerm, contextProfileId, searchContextId,
                    loggingContext, locale, additionalContext, conversationId, grConfigFilter, searchResultType);
            } else {
                var searchResults = api.retrieveSearchResultsAsync(callbackId, searchTerm, contextProfileId, searchContextId,
                    loggingContext, locale, additionalContext, grConfigFilter, searchResultType, conversationId, queryMode);
            }
            var resultObj = JSON.parse(searchResults);
            outputs.search_results = resultObj;
            if (VAAISearchHelper.isResponseSync(resultObj)) {
                outputs.end_time = new GlideDateTime().getNumericValue().toString();
            } else {
                outputs.callback_id = callbackId;
                outputs.callback_mode = callbackMode;
            }
        } catch (ex) {
            VAAISearchHelper.getLogger(context).error("Error retrieving Async search results: {0}", ex.toString());
            var defaultResponse = "{\n" +
                "  \"result\": [\n" +
                "    {\n" +
                "      \"executionResult\": {\n" +
                "          \"searchMetadata\": {\n" +
                "              \"searchResultMetadata\": {\n" +
                "                  \"searchTerm\": \"" + searchTerm + "\"\n" +
                "              }\n" +
                "          },\n" +
                "          \"searchResultsTemplates\": {\n" +
                "              \"items\": [\n" +
                "              ]\n" +
                "          },\n" +
                "          \"geniusResultsTemplates\": {\n" +
                "              \"items\": [\n" +
                "              ]\n" +
                "           }\n" +
                "      },\n" +
                "      \"errors\": [],\n" +
                "      \"status\": 204\n" +
                "    }\n" +
                "  ]\n" +
                "}";
            outputs.search_results = JSON.parse(defaultResponse);
            outputs.end_time = new GlideDateTime().getNumericValue().toString();
        }

        return outputs;
    },

    checkForNullInputs: function(callbackId, searchTerm, contextProfileId, loggingContext, startTime) {
        return gs.nil(callbackId) || gs.nil(searchTerm) || gs.nil(contextProfileId) || gs.nil(loggingContext) || gs.nil(startTime);
    },

    type: 'AISearchRetrieveSearchResults'
};
