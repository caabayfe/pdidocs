var GenAISemanticFilterUtil = Class.create();
GenAISemanticFilterUtil.prototype = {
    initialize: function() {},

    getSearchResults: function(userUtterance, filterStr) {
        var filters = this.ensureObject(filterStr);
        var filterMap = {};
        filters.filterIds.forEach(function(filter) {
            filterMap[filter] = true;
        });

        // Get search results
        var searchResponse = this._invokeSearch(userUtterance);

        // Filter with Gen AI filter ID
        var processedSearchResults = [];
        var processedSearchMap = {};
        var searchResponseResult = searchResponse.getSearchResults();
        for (var ct = 0; ct < searchResponse.getCount(); ct++) {
            var columns = searchResponseResult[ct].getColumns();
            var filterColumn = columns.filter(function(c) { return c.getFieldName() === 'filter'; })[0];
            var currentFilter = filterColumn ? filterColumn.getValue() : null;
            var semanticSimilarity = searchResponseResult[ct].getSemanticSimilarity();
            if (filterMap[currentFilter]) {
                if (!processedSearchMap[currentFilter] || processedSearchMap[currentFilter] < semanticSimilarity) {
                    if (semanticSimilarity > filters.filterMetadata[currentFilter].threshold)
                        processedSearchMap[currentFilter] = semanticSimilarity;
                }
            }
        }

        // Construct valid output structure
        Object.keys(processedSearchMap).forEach(function(filterId) {
            var processedResult = {};
            processedResult.filterId = filterId;
            processedResult.score = processedSearchMap[filterId];
            processedSearchResults.push(processedResult);
        });

        return JSON.stringify(processedSearchResults);
    },

    _invokeSearch: function(query) {
        // This is the search application ID on sys_search_context_config
        var searchContextConfigId = '125e670c430102101ed803295bb8f28f';
        var searchTerm = query;
        var disableSpellCheck = false;
        var facetFilters = [];
        var searchFilters = [];
        var selectedSortOptions = [];
        var paginationToken = null;
        var sortOptions = null;
        var locale = 'en';
        var additionalContext = null;
        var semanticSearch = true;
        var forceSkipSignalsLogging = true;
        var isDebug = false;
        var requestedFields = {
            sys_gen_ai_filter_sample: ['sample_text', 'filter']
        };
        var api = new sn_search.ScriptableSearchAPI();
        return api.search(searchContextConfigId, searchTerm, paginationToken, disableSpellCheck, facetFilters, searchFilters, requestedFields, locale, additionalContext, semanticSearch, isDebug, forceSkipSignalsLogging, selectedSortOptions, 'REGULAR');
    },
    ensureObject: function(obj) {
        if (typeof obj === 'string')
		    return JSON.parse(obj);
    return obj;
    },

    type: 'GenAISemanticFilterUtil'
};
