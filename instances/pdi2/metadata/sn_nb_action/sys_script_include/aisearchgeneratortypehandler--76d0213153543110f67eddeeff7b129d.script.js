var AISearchGeneratorTypeHandler = Class.create();
            AISearchGeneratorTypeHandler.prototype = Object.extendsObject(sn_nb_action.GeneratorTypeHandlerBase, {
                initialize: function() {
                    this._log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
                },

                getId: function() {
                    return Constants.GENERATOR_TYPE_SYS_ID.AI_SEARCH;
                },

                getOutputSchema: function(param) {
                    if (gs.nil(this._log)) {
                        this._log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
                    }

                    var schemaObjectList = [];
                    return {
                        status: Constants.STATUS_SUCCESS,
                        schema: schemaObjectList,
                        metaData: {}
                    };
                },

                /**
                * This function will return search results object, pagination token, sort options and filter details.
                */
                getOutputs: function(param) {

                    if (gs.nil(this._log)) {
                        this._log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
                    }
                    this.NextBestActionService = new sn_nb_action.NextBestActionService();

                    var aisOutputObj = [];
                    var refinedSearchAnalyticsPayload = {};
                    var paginationToken = '';
                    try {
                        if (!this.isAisEnabled()) {
                            throw new Error("AI Search is not enabled on this instance.");
                        }

                        var inputs = param.inputs;
                        var searchTerm = inputs && inputs.search_field ? inputs.search_field : param.searchTerm;
                        var searchFilter = param.searchFilter;
                        var selectedSortFilter = param.selectedSortFilter ? param.selectedSortFilter : [];
                        var currentRecordId = param.contextRecord.getUniqueValue();
                        var generatorRecord = param.resourceGeneratorRecord;
                        var context = generatorRecord ? generatorRecord.context.getRefRecord() : param.ruleContext;
                        var shouldLogSignals = param.shouldLogSignals;
                        var searchContextConfigId = context.search_application_configuration;
                        if (!searchContextConfigId) {
                            this._log.error("Search application configuration not added for given context " + context.getUniqueValue());
                            return false;
                        }
                        var searchLimit = searchContextConfigId.search_results_limit;
                        var topN = inputs && inputs.top_n_results && inputs.top_n_results < searchLimit ? inputs.top_n_results : searchLimit;
                        var searchSources = this._fetchSearchSources(context);
                        var applicableFilters = this._getSearchFilters(searchContextConfigId, searchSources);
                        var applicableFiltersIds = [];
                        for (var i = 0; i < applicableFilters.length; i++) {
                            applicableFiltersIds.push(applicableFilters[i].id);
                        }
                        // if search filter exists use it else get search filters based on search result action mapping table
                        var filters = searchFilter && searchFilter.length !== 0 ? searchFilter : applicableFiltersIds;
                        var api = new sn_search.ScriptableSearchAPI();
                        paginationToken = param.paginationToken ? param.paginationToken : '';
                        var disableSpellCheck = false;
                        var selectedFacetFilters = param.selectedFacetFilters ? param.selectedFacetFilters : [];
                        var requestedFields = {};
                        searchTerm = sn_nb_action.NextBestActionUtil.getParsedStringValue(searchTerm);
                        var response = api.search(searchContextConfigId, searchTerm, paginationToken, disableSpellCheck, selectedFacetFilters, filters, requestedFields, '', '', false, false, false, selectedSortFilter);
                        //Added check to handle scenario when getSearchAnalyticsPayloadMap is not accessible from response object, it'll ensure the backward compatibility
                        if (response && typeof response.getSearchAnalyticsPayloadMap === 'function') {
                            var searchAnalyticsPayload = response.getSearchAnalyticsPayloadMap();
                            if (shouldLogSignals || shouldLogSignals == 'true') {
                                this.NextBestActionService.addSearchSignal(Constants.SIGNAL_EVENT.SEARCH_EVENT, Constants.SIGNAL_EVENT_TYPE.INFO, searchAnalyticsPayload);
                            }
                            //Only keeping necessary fields from the search analytics payload which would be helpful to construct the search interaction event payload (SEARCH_RESULT_EVENT/GENIUS_RESULT_EVENT)
                            refinedSearchAnalyticsPayload = this._getRefinedAnalyticsPayload(searchAnalyticsPayload, searchTerm);
                        }
                        var filtersWithCounts = this._fetchSearchFiltersWithCounts(response, applicableFiltersIds);
                        if (filters.length) {
                            var nextPaginationToken = response.getNextPaginationToken();
                            var searchResultsOutput = this._fetchSearchResults(response, topN, currentRecordId, searchLimit);
                            var facetFiltersList = this._fetchFacetFilters(response);
                            var appliedFacetFilters = response.getAppliedFacetFilters();
                            var appliedFacetFiltersMetadata = this._getAppliedFacetFiltersMetadata(facetFiltersList, appliedFacetFilters);
                            var applicableSortOptions = this._getSortOptions(searchContextConfigId);
                        }
                        if (filtersWithCounts.length == 0 && searchResultsOutput.length != 0)
                            filtersWithCounts = applicableFilters;

                        if (paginationToken == '') {
                            var geniusOutput = this._fetchGeniusResults(response, currentRecordId);
                            aisOutputObj = aisOutputObj.concat(geniusOutput);
                        }

                        if (filters.length)
                            aisOutputObj = aisOutputObj.concat(searchResultsOutput);

                        var previousPaginationToken = '';
                        if (paginationToken) {
                            previousPaginationToken = response.getPreviousPaginationToken();
                        }

                    } catch (ex) {
                        this._log.error("Failed to fetch results using AI Search API. " + ex);
                        var errorDetails = new RAExceptionManager("INVALID_SEARCH_API_RESPONSE");
                        return {
                            status: Constants.STATUS_ERROR,
                            errorCode: errorDetails.getCode(),
                            errorMessage: errorDetails.getMessage()
                        };
                    }

                    return {
                        status: Constants.STATUS_SUCCESS,
                        outputs: aisOutputObj,
                        paginationToken: nextPaginationToken,
                        filters: filtersWithCounts,
                        facetFilters: facetFiltersList,
                        appliedFacetFiltersMetadata: appliedFacetFiltersMetadata,
                        searchTerm: searchTerm,
                        searchResultLimit: searchLimit,
                        previousPaginationToken: previousPaginationToken,
                        applicableSortOptions: applicableSortOptions,
                        refinedSearchAnalyticsPayload: refinedSearchAnalyticsPayload
                    };
                },

                /**
                * This function will return search filters and sort options.
                */
                getSearchFiltersWithCount: function(param) {
                    if (gs.nil(this._log)) {
                        this._log = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
                    }
                    this.NextBestActionService = new sn_nb_action.NextBestActionService();
                    var refinedSearchAnalyticsPayload = {};
                    try {
                        if (!this.isAisEnabled()) {
                            throw new Error("AI Search is not enabled on this instance.");
                        }

                        var searchTerm = param.searchTerm;
                        var context = param.ruleContext;
                        var shouldLogSignals = param.shouldLogSignals;
                        var searchContextConfigId = context.search_application_configuration;
                        if (!searchContextConfigId) {
                            this._log.error("Search application configuration not added for given context " + context.getUniqueValue());
                            return false;
                        }
                        var searchSources = this._fetchSearchSources(context);
                        var applicableFilters = this._getSearchFilters(searchContextConfigId, searchSources);
                        var filtersWithCounts = [];
                        var sortOptions = this._getSortOptions(searchContextConfigId);
                        if (!searchTerm || !searchTerm.trim() || applicableFilters.length == 0) {
                            filtersWithCounts = applicableFilters;
                        } else {
                            var applicableFiltersIds = [];
                            for (var i = 0; i < applicableFilters.length; i++) {
                                applicableFiltersIds.push(applicableFilters[i].id);
                            }
                            var api = new sn_search.ScriptableSearchAPI();
                            var paginationToken = '';
                            var disableSpellCheck = false;
                            var selectedFacetFilters = [];
                            var filters = applicableFiltersIds;
                            var requestedFields = {};
                            var selectedSortFilter = [];
                            searchTerm = sn_nb_action.NextBestActionUtil.getParsedStringValue(searchTerm);
                            var response = api.search(searchContextConfigId, searchTerm, paginationToken, disableSpellCheck, selectedFacetFilters, filters, requestedFields, '', '', false, false, false, selectedSortFilter);
                            //Added check to handle scenario when getSearchAnalyticsPayloadMap is not accessible from response object, it'll ensure the backward compatibility
                            if (response && typeof response.getSearchAnalyticsPayloadMap === 'function') {
                                var searchAnalyticsPayload = response.getSearchAnalyticsPayloadMap();
                                if (shouldLogSignals || shouldLogSignals == 'true') {
                                    this.NextBestActionService.addSearchSignal(Constants.SIGNAL_EVENT.SEARCH_EVENT, Constants.SIGNAL_EVENT_TYPE.INFO, searchAnalyticsPayload);
                                }
                                //Only keeping necessary fields from the search analytics payload which would be helpful to construct the search interaction event payload (SEARCH_RESULT_EVENT/GENIUS_RESULT_EVENT)
                                refinedSearchAnalyticsPayload = this._getRefinedAnalyticsPayload(searchAnalyticsPayload, searchTerm);
                            }
                            filtersWithCounts = this._fetchSearchFiltersWithCounts(response, applicableFiltersIds);
                            if (filtersWithCounts.length == 0)
                                filtersWithCounts = applicableFilters;
                        }
                    } catch (ex) {
                        this._log.error("Failed to fetch search filters with count using AI Search API. " + ex);
                        var errorDetails = new RAExceptionManager("INVALID_SEARCH_API_RESPONSE");
                        return {
                            status: Constants.STATUS_ERROR,
                            errorCode: errorDetails.getCode(),
                            errorMessage: errorDetails.getMessage()
                        };
                    }

                    return {
                        status: Constants.STATUS_SUCCESS,
                        filters: filtersWithCounts,
                        applicableSortOptions: sortOptions,
                        refinedSearchAnalyticsPayload: refinedSearchAnalyticsPayload
                    };
                },
                _fetchGeniusResults: function(response, currentRecordId) {
                    var geniusResults = response.getGeniusResults();
                    var geniusOutput = [];

                    try {
                        if (geniusResults.length !== 0) {
                            for (var i = 0; i < geniusResults.length; i++) {
                                var geniusData = geniusResults[i].getData();
                                var actionObject = {};
                                actionObject[Constants.MODEL_ID] = geniusResults[i].getModelId();

                                for (var j = 0; j < geniusData.length; j++) {
                                    actionObject[geniusData[j].getFieldName()] = geniusData[j].getValue();
                                }

                                var sysid = actionObject[Constants.COL_SYS_ID];
                                if (sysid && sysid != currentRecordId) {
                                    var tableName = actionObject[Constants.COL_TABLE];
                                    if (tableName) {
                                        var searchOutputRecord = this._fetchSearchResultRecord(tableName, sysid);
                                        actionObject[Constants.SEARCH_RESULT_OUTPUT_NAME] = searchOutputRecord;
                                    }
                                }

                                var teaser = actionObject[Constants.AI_SEARCH_TEASER_TEXT];
                                if (teaser) {
                                    teaser = teaser.replaceAll("<highlight>", "<mark>");
                                    teaser = teaser.replaceAll("</highlight>", "</mark>");
                                    actionObject[Constants.SEARCH_TEASER_TEXT_NAME] = teaser;
                                } else {
                                    actionObject[Constants.SEARCH_TEASER_TEXT_NAME] = '';
                                }
                                geniusOutput.push(actionObject);
                            }
                        }
                    } catch (ex) {
                        this._log.error("Error in fetching Genius Results:", ex);
                        var errorDetails = new RAExceptionManager("INVALID_GENIUS_RESULT_RESPONSE");
                        return {
                            status: Constants.STATUS_ERROR,
                            errorCode: errorDetails.getCode(),
                            errorMessage: errorDetails.getMessage()
                        };
                    }

                    return geniusOutput;
                },
                _fetchSearchResults: function(response, topN, currentRecordId, searchLimit) {
                    var searchResults = response.getSearchResults();
                    var searchOutput = [];
                    var filtersWithCounts = [];

                    try {
                        if (searchResults.length !== 0) {
                            for (var index = 0; index < topN; index++) {
                                if (searchResults[index]) {
                                    var result = searchResults[index];
                                    var sysid = result.getSysId();
                                    if (sysid != currentRecordId) {
                                        var actionObject = {};
                                        var teaser = result.getText();
                                        var tableName = result.getTable();
                                        var columns = result.getColumns();
                                        var title = result.getTitle();
                                        var searchUrl = result.getUrl();
                                        var documentIndex = result.getDocumentIndex();
                                        var aisDocId = result.getAisDocId();
                                        var previewFields = [];
                                        columns.forEach(function(column) {
                                            previewFields.push({
                                                label: column.getLabel(),
                                                displayValue: column.getDisplayValue()
                                            });
                                        });
                                        var searchPreviewFields = {
                                            "previewFields": previewFields
                                        };
                                        var searchOutputRecord = this._fetchSearchResultRecord(tableName, sysid);
                                        var searchResultNumber = this._fetchResultNumber(tableName, sysid);
                                        actionObject[Constants.SEARCH_RESULT_OUTPUT_NAME] = searchOutputRecord;
                                        actionObject[Constants.SEARCH_RESULT_NUMBER] = searchResultNumber;
                                        actionObject[Constants.SEARCH_RESULT_TABLE_NAME] = tableName;
                                        actionObject[Constants.SEARCH_RESULT_SYSID_NAME] = sysid;
                                        actionObject[Constants.SEARCH_RESULT_TITLE_NAME] = title;
                                        actionObject[Constants.SEARCH_RESULT_PREVIEW_NAME] = searchPreviewFields;
                                        actionObject[Constants.SEARCH_RESULT_URL_NAME] = searchUrl;
                                        actionObject[Constants.SEARCH_RESULT_DOCUMENT_INDEX] = documentIndex;
                                        actionObject[Constants.SEARCH_RESULT_AIS_DOC_ID] = aisDocId;
                                        if (teaser) {
                                            teaser = teaser.replaceAll("<highlight>", "<mark>");
                                            teaser = teaser.replaceAll("</highlight>", "</mark>");
                                            actionObject[Constants.SEARCH_TEASER_TEXT_NAME] = teaser;
                                        } else {
                                            actionObject[Constants.SEARCH_TEASER_TEXT_NAME] = '';
                                        }
                                        searchOutput.push(actionObject);
                                    } else {
                                        if (topN < searchLimit)
                                            topN++;

                                    }
                                }
                            }
                        }
                    } catch (ex) {
                        this._log.error("Error in fetching Search Results:", ex);
                        var errorDetails = new RAExceptionManager("INVALID_SEARCH_RESULT_RESPONSE");
                        return {
                            status: Constants.STATUS_ERROR,
                            errorCode: errorDetails.getCode(),
                            errorMessage: errorDetails.getMessage()
                        };
                    }

                    return searchOutput;

                },


                _fetchSearchResultRecord: function(table, sysid) {
                    var gr = new GlideRecord(table);
                    gr.get(sysid);
                    return gr;

                },
                /* return the search result record number if the number field is present. */
                _fetchResultNumber: function(table, sysid) {
                    var gr = new GlideRecord(table);
                    if (gr.get(sysid) && gr.isValidField('number')) {
                        return gr.getValue('number');
                    }
                    return '';
                },
                // Tables on which the search will be performed
                _fetchSearchSources: function(context) {
                    var searchTables = [];
                    var gr = new GlideRecord(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                    gr.addQuery(Constants.COL_CONTEXT, context.getUniqueValue());
                    gr.addQuery(Constants.COL_MAP_GENIUS_RESULT, Constants.CHOICE_NO);
                    gr.addActiveQuery();
                    gr.query();
                    while (gr.next()) {
                        searchTables.push(gr.getValue(Constants.COL_SEARCH_SOURCE_TABLE));
                    }
                    return searchTables;
                },
                _fetchSearchFiltersWithCounts: function(searchResponse, applicableFilters) {
                    var searchFilters = [];
                    var totalCount = 0;
                    try {
                        var filters = searchResponse.getSearchFilters();
                        var filtersLength = filters.length;
                        for (var i = 0; i < filtersLength; i++) {
                            var filter = filters[i];
                            var id = filter.getSysId();
                            var label = filter.getLabel();
                            var count = filter.getResultCount();
                            if (label == Constants.ALL || this._hasFilter(applicableFilters, id)) {
                                searchFilters.push({
                                    id: id,
                                    label: label,
                                    count: count
                                });
                                if (label != Constants.ALL) {
                                    totalCount += count;
                                }
                            }
                        }

                        searchFilters[0].count = totalCount;
                        return searchFilters;
                    } catch (ex) {
                        return searchFilters;
                    }
                },

                _fetchFacetFilters: function(searchResponse) {
                    var facetFilters = [];
                    try {
                        var facets = searchResponse.getSearchFacets();
                        var facetLength = facets.length;
                        for (var i = 0; i < facetLength; i++) {
                            var type = facets[i].getType();
                            var name = facets[i].getName();
                            var optionLimit = facets[i].getOptionLimit();
                            var order = facets[i].getOrder();
                            var facetConfigSysId = facets[i].getFacetConfigId();
                            var data = facets[i].getData();
                            var count = data.getCount();
                            var options = data.getOptions();
                            var optionsList = [];
                            for (var j = 0; j < options.length; j++) {
                                var label = options[j].getLabel();
                                var value = options[j].getValue();
                                var optionsCount = options[j].getCount();
                                optionsList.push({
                                    "label": label,
                                    "value": value,
                                    "count": optionsCount
                                })
                            }
                            facetFilters.push({
                                "type": type,
                                "name": name,
                                "order": order,
                                "optionLimit": optionLimit,
                                "facetConfigSysId": facetConfigSysId,
                                "data": {
                                    "count": count,
                                    "options": optionsList
                                }
                            });
                        }
                        return facetFilters;
                    } catch (ex) {
                        gs.error("Facet Filter Exception : " + ex);
                        return facetFilters;
                    }
                },
                _getAppliedFacetFiltersMetadata: function(facetFiltersList, appliedFacetFilters) {
                    var appliedFacetFiltersMetadata = [];
                    try {
                        for (var i = 0; i < facetFiltersList.length; i++) {
                            var facet = facetFiltersList[i];
                            var options = facet.data.options || [];
                            for (var j = 0; j < appliedFacetFilters.length; j++) {
                                var appliedFilter = appliedFacetFilters[j];
                                var matchingOption = this._findOptionByValue(options, appliedFilter);
                                if (matchingOption) {
                                    appliedFacetFiltersMetadata.push({
                                        facetFilter: matchingOption.value,
                                        applied: true,
                                        type: facet.type,
                                    });
                                }
                            }
                        }
                        return appliedFacetFiltersMetadata;
                    } catch (ex) {
                        gs.error("Exception in getting Applied Facet Filters Metadata : " + ex);
                        return appliedFacetFiltersMetadata;
                    }

                },
                _findOptionByValue: function(options, value) {
                    for (var k = 0; k < options.length; k++) {
                        var option = options[k];
                        if (option.value === value) {
                            return option;
                        }
                    }
                    return null;
                },

                _hasFilter: function(applicableFilters, id) {
                    var filterLength = applicableFilters.length;
                    for (var i = 0; i < filterLength; i++) {
                        if (applicableFilters[i] == id)
                            return true;
                    }
                    return false;
                },

                _getSearchFilters: function(searchContextConfigId, searchSources) {
                    var filters = [];
                    var searchFilterGr = new GlideRecord(Constants.TBL_SEARCH_FILTER);
                    searchFilterGr.addQuery(Constants.COL_SEARCH_CONTEXT_CONFIG, searchContextConfigId);
                    searchFilterGr.addQuery(Constants.COL_ACTIVE, true);
                    searchFilterGr.addQuery('ais_search_source.datasource.source', 'IN', searchSources);
                    searchFilterGr.orderBy(Constants.COL_ORDER);
                    searchFilterGr.query();
                    while (searchFilterGr.next()) {
                        var id = searchFilterGr.getUniqueValue();
                        var label = searchFilterGr.getValue(Constants.COL_LABEL);
                        filters.push({
                            id: id,
                            label: label
                        });
                    }
                    return filters;
                },

                _getSortOptions: function(searchContextConfigId) {
                    var sortOptions = [];
                    var sortFilterGr = new GlideRecord(Constants.TBL_SORT_OPTION);
                    sortFilterGr.addQuery(Constants.COL_SEARCH_CONTEXT_CONFIG, searchContextConfigId);
                    sortFilterGr.addQuery(Constants.COL_ACTIVE, true);
                    sortFilterGr.query();
                    while (sortFilterGr.next()) {
                        var id = sortFilterGr.getUniqueValue();
                        var label = sortFilterGr.getDisplayValue(Constants.COL_SORT_OPTION_LABEL);
                        sortOptions.push({
                            id: id,
                            label: label
                        });
                    }
                    return sortOptions;
                },

                isAisEnabled: function() {
                    var ais = new sn_ais.StatusApi();
                    return ais.isAisEnabled() && ais.isAisInitialized();
                },

                _getRefinedAnalyticsPayload: function(searchAnalyticsPayload, searchTerm) {
                    return {
                        appliedFacetFilters: (searchAnalyticsPayload && searchAnalyticsPayload.appliedFacetFilters) || [],
                        appliedFilterIds: (searchAnalyticsPayload && searchAnalyticsPayload.appliedFilterIds) || [],
                        appliedSortOptionId: (searchAnalyticsPayload && searchAnalyticsPayload.appliedSortOptionId) || '',
                        searchContextConfigId: (searchAnalyticsPayload && searchAnalyticsPayload.searchContextConfigId) || '',
                        sessionId: (searchAnalyticsPayload && searchAnalyticsPayload.sessionId) || '',
                        userId: (searchAnalyticsPayload && searchAnalyticsPayload.userId) || '',
                        queryTerm: searchTerm || ''
                    };
                },

                type: "AISearchGeneratorTypeHandler",
            });
