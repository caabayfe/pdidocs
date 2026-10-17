function transform(input) {

    function getResultsPerPage(searchAppId) {
        var cachedValue = GlideCacheManager.get('search_context_config_search_result_limit_cache', searchAppId);
        if (cachedValue != null && ('' + cachedValue).trim() != '')
            return cachedValue;

        var searchApplicationRecord = new GlideRecord('sys_search_context_config');
        if (searchApplicationRecord.get(searchAppId)) {
            var searchResultLimit = searchApplicationRecord.getValue('search_results_limit');
            if (searchResultLimit && searchResultLimit.length > 0) {
                searchResultLimit = parseInt(searchResultLimit);
                GlideCacheManager.put('search_context_config_search_result_limit_cache', searchAppId, searchResultLimit);
                return searchResultLimit;
            }
        }
    }

    var searchResponse =
        input
        .searchQueryResponse
        .data
        .GlideSearch_Query;

    if (!searchResponse) {
        return null;
    }

    var resultsPerPage = getResultsPerPage(input.searchContextConfigId);
    var totalHits = searchResponse.search.totalHits;
    var showResultCount = searchResponse.search.showResultCount;
    var searchProfileDetails = JSON.parse(searchResponse.search.searchProfileDetails);

    var searchResultMetadata = {
        searchTerm: searchResponse.search.term,
        rewrittenSearchTerm: searchResponse.search.rewrittenTerm,
        correctedSearchTerm: searchResponse.search.spellCorrectedTerm,
        count: searchResponse.search.count,
        previousPageToken: searchResponse.search.previousPaginationToken,
        nextPageToken: searchResponse.search.nextPaginationToken,
        currentPage: searchResponse.search.currentPage,
        resultsPerPage: resultsPerPage,
        matchedQueryIntents: searchResponse.search.matchedQueryIntents,
        matchedGeniusResultIntents: searchResponse.search.matchedGeniusResultIntents,
        matchedRules: searchResponse.search.matchedRules,
        responseTimeInMs: searchResponse.search.responseTimeInMs,
        queryLanguage: searchResponse.search.queryLanguage,
        searchAnalyticsPayload: searchResponse.search.searchAnalyticsPayload,
        showResultCount: showResultCount,
        totalHits: totalHits,
        queryFeedback: searchResponse.search.queryFeedback,
        queryAnalytics: searchResponse.search.queryAnalytics,
        intentSwitch: searchResponse.search.intentSwitch,
        additionalContext: searchResponse.search.additionalContext,
        asyncGeniusResultChannelName: searchResponse.search.asyncGeniusResultChannelName,
        asyncGeniusResultsMaxWaitTime: searchResponse.search.asyncGeniusResultsMaxWaitTime,
        primarySearchRequestId: searchResponse.search.primarySearchRequestId,
        awaitingResults: searchResponse.search.awaitingResults,
        pendingResultDetails: searchResponse.search.pendingResultDetails,
        callbackId: searchResponse.search.callbackId,
        queryDisambiguation: searchResponse.search.queryDisambiguation,
        sensitivityFilter: searchResponse.search.sensitivityFilter,
        geniusResultsExecuted: searchResponse.search.geniusResultsExecuted,
	searchProfileDetails: searchProfileDetails
    };

    var filters = searchResponse.search.filters;
    var sortOptions = searchResponse.sortOptions;
    var appliedFacetFilters = searchResponse.search.appliedFacetFiltersMetadata;
    var selectedFilterIds = searchResponse.search.selectedFilterIds;
    var selectedSortOptionIds = searchResponse.search.selectedSortOptionIds;
    var searchFacets = searchResponse.search.searchFacets;
    var filterGeniusResultsBySearchSource = searchResponse.search.filterGeniusResultsBySearchSource;
    var showDisabledFacets = searchResponse.search.showDisabledFacets;
    var hybridSearch = searchResponse.search.hybridSearch;

    if (input.isDebug)
        searchResultMetadata['searchResponse'] = searchResponse;

    return {
        viewAllLinkData: input.viewAllLinkData,
        filters: filters,
        sortOptions: sortOptions,
        appliedFacetFilters: appliedFacetFilters,
        selectedFilterIds: selectedFilterIds,
        selectedSortOptionIds: selectedSortOptionIds,
        searchFacets: searchFacets,
        filterGeniusResultsBySearchSource: filterGeniusResultsBySearchSource,
        showDisabledFacets: showDisabledFacets,
        hybridSearch: hybridSearch,
        searchResultMetadata: searchResultMetadata
    };
}
