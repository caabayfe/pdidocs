(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var e2eTimer = new GlideStopWatch();
    var searchContextConfigId = request.queryParams.search_context_config_id;
    var searchTerm = request.queryParams.search_term || '';
    var locale = request.queryParams.locale || '';
    var additionalContext = request.queryParams.additional_context || '';

    if (!searchContextConfigId) {
        response.setStatus(400);
        response.setBody({
            error: 'search_context_config_id is required'
        });
        return;
    }

    // Always get typeahead suggestion reader results
    var suggestions;
    try {
        var typeaheadSuggesionTimer = new GlideStopWatch();
        var suggestionResult = new sn_search.ScriptableTypeaheadSuggestionService().getSuggestions(searchContextConfigId, searchTerm, [], [], locale, additionalContext);
        suggestions = JSON.parse(suggestionResult.toJson());
    } catch (e) {
        gs.error("[SUGGESTION REST API] Error during typeahead suggestion retrieval", e);
    }
    typeaheadSuggesionTimer.stop();

    // Get exact match only when term is non-empty and matches the criterion regex.
    // Note: the regex pattern is read from a system property — avoid catastrophic backtracking
    // patterns (ReDoS) when setting com.snc.agent_workspace.global_search.typeahead.exact_match_request_criterion_regex.
    var exactMatchResult = null;
    var exactMatchTimer = new GlideStopWatch();
    if (searchTerm) {
        var pattern = gs.getProperty(
            'com.snc.agent_workspace.global_search.typeahead.exact_match_request_criterion_regex', '^\\s*[a-zA-Z]+\\d+\\s*$');
        try {
            var regex = new RegExp(pattern);
            if (regex.test(searchTerm)) {
                var exactMatchResultObj = new sn_search.ScriptableExactMatchService().exactMatch(searchContextConfigId, searchTerm);
                if (exactMatchResultObj) {
                    exactMatchResult = JSON.parse(exactMatchResultObj.toJson());
                }
            }
        } catch (e) {
            gs.error('[SUGGESTION REST API] getUnifiedSuggestions: exact match lookup failed for term: ' + searchTerm, e);
        }
    }
    exactMatchTimer.stop();

    e2eTimer.stop();
    if (GlideProperties.getBoolean('glide.search.performance.logger.enabled')) {
        gs.info('[SUGGESTION REST API] Total time: ' + e2eTimer.getTime() + ' ms, Typeahead time: ' + typeaheadSuggesionTimer.getTime() + ' ms, Exact Match time: ' + exactMatchTimer.getTime() + ' ms');
    }

    // Exact match is returned first when present, followed by suggestion reader results
    response.setBody({
        exact_match: exactMatchResult,
        suggestions: suggestions
    });

})(request, response);
