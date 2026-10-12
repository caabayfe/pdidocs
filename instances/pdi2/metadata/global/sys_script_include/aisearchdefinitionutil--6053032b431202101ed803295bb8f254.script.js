var AISearchDefinitionUtil = Class.create();
AISearchDefinitionUtil.prototype = {
    initialize: function() {
        this.SERVICENOW_RAG_DEFINITION = "1af20be7431202101ed803295bb8f28e";
    },

    execute: function(inputs) {
        var searchResults = this._getAISearchResults(inputs);
        return searchResults;
    },

    _logResults: function(
        startedAt,
        inputs,
        results,
        status,
        errorCode,
        errorMessage
    ) {
        var logInputs = {
            "definition": this.SERVICENOW_RAG_DEFINITION,
            "status": status,
            "started_at": startedAt,
            "prompt": JSON.stringify(inputs || {}),
            "response": JSON.stringify(results || []),
            "error_code": errorCode || "",
            "error": errorMessage || "",
            "caller": "",
            "prompt_config_id": "",
            "skill_config_id": ""
        };

        new sn_generative_ai.GenAIStatsUtil().logStats(logInputs);
    },

    _getAISearchResults: function(inputs) {
        try {
            // Get startedAt time
            var startedAt = new GlideDateTime();

            // Get parameters
            var searchContextConfigId = inputs.search_context_config_id;
            var searchTerm = inputs.search_term;
            var disableSpellCheck = inputs.disable_spell_check || false;
            var facetFilters = inputs.facet_filters || [];
            var searchFilters = inputs.search_filters || [];
            var paginationToken = inputs.pagination_token || null;
            var selectedSortOptions = inputs.selected_sort_options || null;
            var locale = inputs.locale || "en";
            var forceSkipSignalsLogging = inputs.force_skip_signals_logging || true;
            var isDebug = inputs.is_debug || true;
            var requestedFields = inputs.requested_fields || null;
            var asyncParams = JSON.stringify(inputs.async_params) || "{}";
            var searchPurview = inputs.search_purview || "REGULAR";

            // Add logging context if not present in request
            var additional_context = inputs.additional_context || {};
            if (!inputs.additional_context?.logging_context) {
                additional_context.logging_context = {
                    "capability_name": "ServiceNow RAG (Deprecated)",
                    "capability_id": "69e287e7431202101ed803295bb8f285",
                    "feature_invocation_id": inputs.feature_invocation_id || ""
                };
            }
            var additionalContext = JSON.stringify(additional_context);

            // Determine search type params with search_type attribute
            var semanticSearch = false;
            var semanticConfigurations = "{}";
            var searchType = inputs.search_type ? inputs.search_type.toLowerCase() : "keyword";
            switch (searchType) {
                case "keyword":
                    break;
                case "semantic":
                    semanticSearch = true;
                    semanticConfigurations = JSON.stringify({
                        "semanticMode": "default"
                    });
                    break;
                case "hybrid":
                    semanticSearch = true;
                    semanticConfigurations = JSON.stringify({
                        "semanticMode": "hybrid"
                    });
                    break;
            }

            // Invoke search
            var api = new sn_search.ScriptableSearchAPI();
            var searchResponse = api.search(searchContextConfigId, searchTerm, paginationToken, disableSpellCheck,
                facetFilters, searchFilters, requestedFields, locale, additionalContext, semanticSearch, isDebug,
                forceSkipSignalsLogging, selectedSortOptions, searchPurview, asyncParams, semanticConfigurations);

            var output = [];
            for (var i = 0; i < searchResponse.getCount(); i++) {
                // Get basic search result details
                var currentResult = {
                    "text": searchResponse.getSearchResults()[i].getText(),
                    "title": searchResponse.getSearchResults()[i].getTitle(),
                    "table": searchResponse.getSearchResults()[i].getTable(),
                    "url": searchResponse.getSearchResults()[i].getUrl(),
                    "semantic_embedding": searchResponse.getSearchResults()[i].getSemanticEmbedding(),
                    "semantic_similarity": searchResponse.getSearchResults()[i].getSemanticSimilarity()
                };

                // Get individual column values
                var columns = [];
                searchResponse.getSearchResults()[i].getColumns().forEach(function(columnInfo) {
                    columns.push({
                        "fieldName": columnInfo.getFieldName(),
                        "label": columnInfo.getLabel(),
                        "value": columnInfo.getValue(),
                        "displayValue": columnInfo.getDisplayValue()
                    });
                });
                currentResult.columns = columns;

                // Add search result
                output.push(currentResult);
            }

            // Log results
            this._logResults(
                startedAt,
                inputs,
                output,
                "success"
            );

            return {
                "search_results": JSON.stringify(output || [])
            };
        } catch (e) {
            var errorMessage = "Error during AI Search: " + e;
            gs.error(errorMessage);

            // Log results
            this._logResults(
                startedAt,
                inputs,
                [],
                "error",
                200000,
                errorMessage
            );

            return {
                "search_results": JSON.stringify([])
            };
        }
    },

    type: 'AISearchDefinitionUtil'
};
