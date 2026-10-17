function transform(input) {
    var searchResponse =
        input
        .searchQueryResponse
        .data
        .GlideSearch_Query;

    if (!searchResponse) {
        return null;
    }

    var searchResultMetadata = {
        searchTerm: searchResponse.search.term,
        correctedSearchTerm: searchResponse.search.spellCorrectedTerm,
        count: searchResponse.search.count,
        previousPageToken: searchResponse.search.previousPaginationToken,
        nextPageToken: searchResponse.search.nextPaginationToken,
        currentPage: searchResponse.search.currentPage,
        matchedQueryIntents: searchResponse.search.matchedQueryIntents,
        matchedGeniusResultIntents: searchResponse.search.matchedGeniusResultIntents,
        responseTimeInMs: searchResponse.search.responseTimeInMs,
        queryLanguage: searchResponse.search.queryLanguage,
        searchAnalyticsPayload: searchResponse.search.searchAnalyticsPayload
    };

    var filters = searchResponse.filters;
    var sortOptions = searchResponse.sortOptions;
    var appliedFacetFilters = searchResponse.search.appliedFacetFilters;
    var selectedFilterIds = searchResponse.search.selectedFilterIds;
    var selectedSortOptionIds = searchResponse.search.selectedSortOptionIds;
    var searchFacets = searchResponse.search.searchFacets;

    return {
        viewAllLinkData: input.viewAllLinkData,
        filters: filters,
        sortOptions: sortOptions,
        appliedFacetFilters: appliedFacetFilters,
        selectedFilterIds: selectedFilterIds,
        selectedSortOptionIds: selectedSortOptionIds,
        searchFacets: searchFacets,
        searchResultMetadata: searchResultMetadata
    };
}
