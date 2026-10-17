function include(proxyArg, params) {
    const {
        api,
        event,
        helpers,
        imports
    } = params;
    const handleSearchEvents = () => {
        const {
            name,
            payload
        } = event;
        switch (name) {
            case 'MACROPONENT_READY': {
                handleMacroponentPropertyChange();
                break;
            }
            case 'MACROPONENT_PROPERTY_CHANGED': {
                handleMacroponentPropertyChange();
                break;
            }
            case 'MACROPONENT_VIEWPORT_LOAD_COMPLETED': {
                if(payload.route == "guidance"){
                    api.setState('hideSidepanel', false);
                }
                break;
            }
            case 'NOW_INPUT#VALUE_SET': {
                helpers.navigate.setRouteParams({
                    'params': {
                        'contextSysId': api.context.props.contextSysId,
                        'searchTerm': payload.value,
                        'selectedFilterTab': 'all-filter',
                        'selectedFacetOptions': 'empty-facet',
                        'selectedSortOption': "empty-sort-option"
                    }
                });
                break;
            }
            case 'NOW_INPUT#ENTER_KEYDOWN': {
                helpers.navigate.setRouteParams({
                    'params': {
                        'contextSysId': api.context.props.contextSysId,
                        'searchTerm': payload.fieldValue,
                        'selectedFilterTab': 'all-filter',
                        'selectedFacetOptions': 'empty-facet',
                        'selectedSortOption': "empty-sort-option"
                    }
                });
                break;
            }
            case 'NOW_INPUT#INPUT': {
                api.setState('searchTermBeforeInitiateSearch', payload.fieldValue);
                if(payload.fieldValue == ''){
                    api.setState('showClearSearchResult', false);
                }
            }
            case 'SN_SEARCH_RESULT_WRAPPER#TAB_FILTER_SELECTED': {
                let selectedFilter = JSON.parse(payload.selectedFilter);
                if (!selectedFilter) {
                    selectedFilter = [];
                }
                api.setState('selectedFilterTab', selectedFilter);
                api.setState('facetFilters', []);
                helpers.navigate.setRouteParams({
                    'params': {
                        'contextSysId': api.context.props.contextSysId,
                        'searchTerm': api.state.searchTerm,
                        'selectedFilterTab': selectedFilter.length > 0 ? selectedFilter : 'all-filter',
                        'selectedFacetOptions': api.state.selectedFacetOptions.length > 0  ?  api.state.selectedFacetOptions : 'empty-facet',
                        'selectedSortOption': api.state.selectedSortOption.length > 0 ? api.state.selectedSortOption : "empty-sort-option"
                    }
                });
                break;
            }
            case 'SN_SEARCH_RESULT_WRAPPER#FACET_SELECTIONS_UPDATED': {
                var selectedFilters = payload.selectedFilters;
                if (typeof selectedFilters === 'object') {
                    selectedFilters = [];
                } else {
                    selectedFilters = JSON.parse(selectedFilters);
                }
                api.setState('selectedFacetOptions', selectedFilters);
                var selectedFilterParam = selectedFilters.length > 0 ? selectedFilters : 'empty-facet';
                var selectedSources;
                if(payload.sourceFilters && payload.sourceFilters != 'undefined' && payload.sourceFilters != 'null'){
                    selectedSources = JSON.parse(payload.sourceFilters);
                    if (!selectedSources) {
                        selectedSources = [];
                    }
                    api.setState('selectedFilterTab', selectedSources);

                } else {
                    selectedSources = api.state.selectedFilterTab;
                }
                const {
                    searchTerm,
                    selectedSortOption
                } = api.state;
                helpers.navigate.setRouteParams({
                    'params': {
                        'contextSysId': api.context.props.contextSysId,
                        'searchTerm': searchTerm,
                        'selectedFilterTab': selectedSources.length > 0 ? selectedSources : 'all-filter',
                        'selectedFacetOptions': selectedFilterParam,
                        'selectedSortOption': selectedSortOption.length > 0 ? selectedSortOption : "empty-sort-option"
                    }
                });
                break;
            }
            case 'SN_SEARCH_RESULT_WRAPPER#PAGINATION_BUTTON_CLICKED': {
                const paginationToken = payload.paginationToken;
                const {
                    searchTerm,
                    selectedFilterTab,
                    selectedFacetOptions,
                    selectedSortOption
                } = api.state;
                fetchSearchResults({
                    search_term: searchTerm,
                    filter: selectedFilterTab,
                    facet_filter: selectedFacetOptions,
                    sort_filter: selectedSortOption,
                    shouldLogSignals: true,
                    paginationToken
                });
                break;
            }
            case 'SN_SEARCH_RESULT_WRAPPER#SORT_FILTER_SELECTED' : {
                const selectedSortOption = JSON.parse(payload.selectedFilter);
                const {
                    searchTerm,
                    selectedFilterTab,
                    selectedFacetOptions
                } = api.state;
                api.setState('selectedSortOption', selectedSortOption);
                helpers.navigate.setRouteParams({
                    'params': {
                        'contextSysId': api.context.props.contextSysId,
                        'searchTerm': searchTerm,
                        'selectedFilterTab': selectedFilterTab.length > 0 ? selectedFilterTab : 'all-filter',
                        'selectedFacetOptions': selectedFacetOptions.length > 0 ? selectedFacetOptions : 'empty-facet',
                        'selectedSortOption': selectedSortOption.length > 0 ? selectedSortOption : "empty-sort-option"
                    }
                });
                break;
            }
            case 'NOW_BUTTON_ICONIC#CLICKED': {
                api.setState('hideSidepanel', true);
                updateSelectedSearchResult();
                break;
            }
        }
    };

    const handleMacroponentPropertyChange = () => {
        const searchTerm = api.context.props.searchTerm;
        let selectedFilterTab = api.context.props.selectedFilterTab;
        let selectedFacetOptions = api.context.props.selectedFacetOptions;
        let selectedSortOption = api.context.props.selectedSortOption;
        selectedFilterTab = selectedFilterTab == null || selectedFilterTab == 'all-filter' ||  selectedFilterTab == 'selected-facet-options' ? [] : selectedFilterTab;
        selectedFilterTab = typeof selectedFilterTab == 'object' ? selectedFilterTab : [selectedFilterTab];
        selectedFacetOptions = selectedFacetOptions == null ||  selectedFacetOptions == 'empty-facet'  || selectedFacetOptions == 'selected-sort-option' ? [] : selectedFacetOptions;
        selectedFacetOptions = typeof selectedFacetOptions == 'object' ? selectedFacetOptions : selectedFacetOptions.split(',');
        selectedSortOption = (selectedSortOption == null || selectedSortOption == [] || selectedSortOption == "empty-sort-option" )?[]:selectedSortOption;
        selectedSortOption = typeof selectedSortOption == 'object' ? selectedSortOption : [selectedSortOption];
        updateProperties(searchTerm, selectedFilterTab, selectedFacetOptions, selectedSortOption);
        if(searchTerm && searchTerm.length > 0){
            api.setState('showClearSearchResult', true);
        }
        fetchSearchResults({
            search_term: searchTerm,
            filter: selectedFilterTab,
            facet_filter: selectedFacetOptions,
            sort_filter: selectedSortOption,
            shouldLogSignals: true
        });
    } 
    const updateProperties = (searchTerm, selectedFilterTab, selectedFacetOptions, selectedSortOption) => {
        api.setState('searchTerm', searchTerm);
        api.setState('selectedFilterTab', selectedFilterTab);
        api.setState('selectedFacetOptions', selectedFacetOptions);
        api.setState('selectedSortOption', selectedSortOption);
    };

    const fetchSearchResults = (payload) => {
        const searchTerm = payload.search_term;
        api.setState('isLoading', true);
        api.setState('hideSidepanel', true);
        if (!searchTerm || !searchTerm.trim()) {
            api.setState('searchResults', []);
            api.setState('searchFilters', []);
            api.setState('facetFilters', []);
            api.setState('selectedFilterTab', []);
            api.setState('selectedFacetOptions', []);
            api.setState('appliedFacetFiltersMetadata', []);
            api.setState('isLoading', false);
            return;
        }
        let currentPage = api.state.currentPage;
        const paginationToken = payload.paginationToken;
        if (!paginationToken) {
            currentPage = 1;
        } else {
            const { previousPageToken, nextPageToken } = api.state.searchResultMetadata;
            if (paginationToken === previousPageToken) {
                currentPage--;
            } else if (paginationToken === nextPageToken) {
                currentPage++;
            }
        }
        api.setState('currentPage', currentPage);
        helpers.snHttp('/api/sn_nb_action/v1/next_best_action/actions/get_search_result_actions', {
            method: "POST",
            body: {
                table: api.context.props.contextTable,
                sys_id: api.context.props.contextId,
                context_sys_id: api.context.props.contextSysId,
                ...payload
            },
        }).then(response => {
            const result = response.response.result;
            const {
                actionDetails,
                filters,
                facetFilters,
                selectedFilter,
                appliedFacetFiltersMetadata,
                previousPaginationToken,
                searchResultLimit,
                paginationToken,
                contextId,
                applicableSortOptions,
                refinedSearchAnalyticsPayload
            } = result;
            var searchActionsCardDataObj = getListOfActionsData(actionDetails, refinedSearchAnalyticsPayload);
            api.setState('searchResults', searchActionsCardDataObj);
            var searchFilters = getSearchFilters(filters);
            var sortOptions = getSortOptions(applicableSortOptions);
            api.setState('searchFilters', searchFilters);
            api.setState('sortOptions', sortOptions);
            api.setState('facetFilters', facetFilters);
            api.setState('appliedFacetFiltersMetadata', appliedFacetFiltersMetadata);
            const totalResultCount = getTotalResultCount(searchFilters, payload.filter);
            api.setState('totalResultCount', totalResultCount);
            api.setState('searchResultLimit', searchResultLimit);
            const searchResultMetadata = {
                previousPageToken: previousPaginationToken,
                nextPageToken: paginationToken,
                totalHits: getResultCountMessage(currentPage, searchActionsCardDataObj.items, searchResultLimit, totalResultCount),
                searchTerm: searchTerm,
                showResultCount: true,
            };
            api.setState('searchResultMetadata', searchResultMetadata);
            api.setState('nbaContextRecordId', contextId);
            api.setState('isLoading', false);
        }).catch(error => {
            api.setState('isLoading', false);
            console.log('Error: ', error);
        });
    };

    const getTotalResultCount = (filters, selectedFilterTab) => {
        const sysIds = selectedFilterTab?.length ? selectedFilterTab : [null];
        return filters
            .filter(filter => sysIds.includes(filter.sysId))
            .reduce((total, filter) => total + (filter.count || 0), 0);
    };

    const getSearchFilters = (filters) => {
        return filters.map(filter => {
            return {
                sysId: filter.label.toLowerCase() == 'all' ? null : filter.id,
                ...filter
            };
        });
    };

    const getSortOptions = (applicableSortOptions) => {
        return applicableSortOptions.map(applicableSortOption => {
            return {
                sysId: applicableSortOption.id,
                label: applicableSortOption.label
            };
        })
    }

    const getNoEventSupportedActionConfigurations = (actionConfigurations) => {
        for (let key in actionConfigurations) {
            if (actionConfigurations.hasOwnProperty(key)) {
                let config = actionConfigurations[key].configuration;
                // Check if 'eventSupported' is present
                if (config.hasOwnProperty('eventSupported')) {
                    // Set 'eventSupported' to false
                    config.eventSupported = false;
                }
            }
        }
        return actionConfigurations;
    };

    const getListOfActionsData = (listOfActions, refinedSearchAnalyticsPayload) => {
        if (!listOfActions) {
            return {
                items: []
            };
        }
        var listOfActionsCardData = [];
        for (var i = 0; i < listOfActions.length; i++) {
            let actionCard = getActionCardObject(listOfActions[i]);
            actionCard.propValues.table = api.context.props.contextTable;
            actionCard.propValues.tableSysId = api.context.props.contextId;
            actionCard.propValues.contextSysId = api.context.props.contextSysId;
            actionCard.propValues.searchResultId = i;
            let actionConfigurations = api.context.props.actionConfigurations;
             if (typeof actionConfigurations === 'string') {
                    actionConfigurations = JSON.parse(actionConfigurations);
                } 
            actionCard.propValues.actionConfigurations = getNoEventSupportedActionConfigurations(actionConfigurations);
            actionCard.propValues.searchResultAnalyticsPayload = {
                ...actionCard.propValues.searchResultAnalyticsPayload,
                ...refinedSearchAnalyticsPayload
            };
            listOfActionsCardData.push(actionCard);
        }

        var searchActionsCardDataObj = {};
        searchActionsCardDataObj.items = listOfActionsCardData;
        return searchActionsCardDataObj;
    };

    const getActionCardObject = (actionData) => {
        let actionCard = {};
        actionCard['template'] = "sn-next-best-action-wrapper";
        actionCard['propValues'] = mapActionDataToPropValues(actionData);
        return actionCard;
    };

    const mapActionDataToPropValues = (actionData) => {
        const propValues = {};
        propValues['name'] = actionData['title'];
        propValues['description'] = actionData['description'];
        propValues['recommendationHint'] = actionData['recommendationHint'];
        propValues['callToActions'] = actionData['callToActions'];
        propValues['actionTypeLabel'] = actionData['actionType'];
        propValues['icon'] = actionData['iconName'];
        propValues['actionStateLabel'] = actionData['actionState']['label'];
        propValues['actionStateValue'] = actionData['actionState']['value'];
        propValues['previewFields'] = actionData['customAttributes'] ? actionData['customAttributes']['previewFields'] : null;
        propValues['customExperience'] = actionData['customExperience'];
        propValues['sysId'] = actionData['actionId'];
        propValues['actionAttributes'] = '';
        propValues['useCase'] = actionData['useCase'];
        propValues['actionInputs'] = actionData['actionInputs'];
        propValues['actionTypeSysId'] = actionData['actionTypeSysId'];
        propValues['actionId'] = actionData['actionId'];
        propValues['renderer'] = actionData['renderer'];
        propValues['isGenius'] = actionData['isGenius'];
        propValues['isFullSearchView'] = true;
        propValues['isSelected'] = false;
        propValues['searchResultAnalyticsPayload'] = {
            "resultSysId": actionData['searchResultId'],
            "number": actionData['searchResultNumber'],
            "labelDescription": actionData['searchResultTitle'],
            "sourceTable": actionData['searchResultTable'],
            "sourceUrl": actionData['searchResultURL'],
            "signalType": "CLICK",
            "signalValue": actionData["searchResultDocIndex"],
            "aisDocId": actionData["searchResultAISDocId"]
        };

        return propValues;
    };

    const handleSearchResultActions = () => {
        var {
            name,
            payload
        } = event;
        switch (name) {
            case 'SN_SEARCH_RESULT_WRAPPER#DECLARATIVE_ACTION':
                {
                    var eventName = payload.event;
                    var actionPayload = payload.payload;
                    if (eventName == 'ON_SINGLE_CLICK_ACTION') {
                        var pathParams = {
                            table_name: api.context.props.contextTable,
                            sys_id: api.context.props.contextId,
                            action_id: actionPayload.sysId
                        };
                        var body = {
                            actionInputs: actionPayload.actionInputs,
                            actionMetadata: actionPayload.actionMetadata
                        };
                        api.setState('selectedActionId', actionPayload.sysId);
                        updateSelectedSearchResult();
                        onSingleClickActionClicked(pathParams, body);
                    }
                    else if (eventName == 'ON_DRILL_DOWN_ACTION') {
                        helpers.timing.setTimeout(() => {
                               helpers.focus('button_iconic_1');
                        }, 1000);
                        var contextTable = api.context.props.contextTable;
                        var contextId = api.context.props.contextId;
                        var selectedActionId = actionPayload.sysId;
                        var actionBehavior = actionPayload.actionBehavior ?
                            actionPayload.actionBehavior :
                            actionPayload.actionMetadata.actionBehavior;
                        var selectedActionState = actionPayload.actionStateValue;
                        api.setState('selectedActionId', selectedActionId);
                        updateSelectedSearchResult();
                        var body = {
                            actionInputs: actionPayload.actionInputs
                        };
                        if (selectedActionState == 'new') {
                            onDrillDownActionClicked(contextTable, contextId, selectedActionId, actionBehavior, body);
                        }
                    }
                    else if (eventName == 'UPDATE_SEARCH_RESULT_EXECUTION_ID') {
                        var actionDetailId = actionPayload.actionDetailId;
                        var searchResultId = actionPayload.searchResultId;
                        var searchActionsCardDataObj = api.state.searchResults;
                        var items = searchActionsCardDataObj.items.map((searchObj) => {
                            if (searchObj.propValues.searchResultId === searchResultId) {
                                searchObj.propValues.actionDetailId = actionDetailId;
                            }
                            return searchObj;
                        });
                        searchActionsCardDataObj.items = items;
                        api.setState('searchResults', searchActionsCardDataObj);
                    }
                    else if (eventName == 'SN_NEXT_BEST_ACTION_LIST_CONNECTED#LINK_CLICKED') {
                        var fieldProps = actionPayload.openRecordProps;
                        if (fieldProps) {
                            helpers.navigate.to(fieldProps.table === 'kb_knowledge' ? 'kb_view' : 'record', {
                                'table': fieldProps.table,
                                'sysId': fieldProps.sys_id
                            }, {}, false, false, 'current');
                        } else {
                            helpers.navigate.to(actionPayload.table === 'kb_knowledge' ? 'kb_view' : 'record', {
                                'table': actionPayload.table,
                                'sysId': actionPayload.sys_id
                            }, {}, false, false, 'current');
                        }
                    } else if (eventName == 'RA_EXPANDED_SEARCH#ADD_NOTIFICATION') {
                        api.emit(eventName, actionPayload);
                    }
                    break;
                }
            case 'RECORD_WATCHER#MESSAGE_RECEIVED':
                {
                    var searchResultsObject = api.state.searchResults;
                    var clickedActionDetailId = event.payload.data.sys_id;
                    var searchResults = { ...searchResultsObject };
                    let items = [];
                    let isSearchResultFound = false;
                    searchResults.items.forEach(searchActionObj => {
                        if (searchActionObj.propValues.actionDetailId == clickedActionDetailId) {
                            isSearchResultFound = true;
                        } else {
                            items.push(searchActionObj);
                        }
                    });
                    if (isSearchResultFound) {
                        api.setState('hideSidepanel', true);
                    }
                    searchResults.items = items;
                    api.setState('searchResults', searchResults);

                    let searchResultMetadata = { ...api.state.searchResultMetadata };
                    const { currentPage, searchResultLimit, totalResultCount } = api.state;
                    searchResultMetadata.totalHits = getResultCountMessage(currentPage, items, searchResultLimit, totalResultCount);
                    api.setState('searchResultMetadata', searchResultMetadata);
                    break;
                }
        }
    };

    const onSingleClickActionClicked = (pathParams, body) => {
        api.setState('hideSidepanel', true);
        api.setState('isLoading', true);
        helpers.snHttp('/api/sn_nb_action/v1/next_best_action/actions/' + pathParams.table_name + '/' + pathParams.sys_id + '/' + pathParams.action_id + '/execute', {
            method: "PATCH",
            body: body
        }).then(response => {
            var result = response.response.result;
            var actionState = result.state ? result.state : "";
            var statusCode = result.actionDetails && result.actionDetails.statusCode ? result.actionDetails.statusCode : '200';
            api.setState('isLoading', false);
            if (actionState == 'in_error') {
                showRecommendationErrorMessage(result);
            } else if (statusCode == '405') {
                showRecommendationErrorMessage(result);
                hideCurrentAction(api.state.searchResults, result);
            } else {
                showRecommendationCompletionMessage(result);
            }
        }).catch(error => {
            api.setState('isLoading', false);
            console.log('Execute API Error: ', error);
        });
    };

    const onDrillDownActionClicked = (contextTable, contextId, selectedActionId, actionBehavior, body) => {
        api.setState('hideSidepanel', true);
        api.setState('isLoading', true);
        helpers.snHttp('/api/sn_nb_action/v1/next_best_action/actions/' + contextTable + '/' + contextId + '/' + selectedActionId + '/start', {
            method: "PATCH",
            body: body
        }).then(response => {
            var result = response.response.result;
            var statusCode = result.actionDetails && result.actionDetails.statusCode ? result.actionDetails.statusCode : '200';
            api.setState('isLoading', false);
            if (statusCode == '405') {
                showRecommendationErrorMessage(result);
            } else {
                if(typeof(api.context.props.actionConfigurations) === "string"){
                    var actionConfigurations = JSON.parse(api.context.props.actionConfigurations);
                }
                var noEventSupportedActionConfigurations = getNoEventSupportedActionConfigurations(actionConfigurations);
                var selectedActionTag = result.actionDetails.renderer;
                var showInSubTab = actionBehavior === 'sub_tab';
                if (showInSubTab) {
                    if (result.actionDetails.attributes.type == 'guidedDecisionGuidance') {
                       
                        helpers.navigate.to('guidance', {
                            'recommender': result.actionDetails.attributes.recommender,
                            'recommendedBy': result.actionDetails.attributes.recommendedBy
                        }, {'actionConfigurations':noEventSupportedActionConfigurations}, false, false, 'current');
                    } else if (result.actionDetails.attributes.type == 'guidedDecision') {
                        helpers.navigate.to('guided-decisions', {
                            'executionId': result.actionDetails.attributes.executionId,
                            'decisionTreeId': result.actionDetails.attributes.decisionTreeId
                        }, {}, false, false, 'current');
                    }
                } else {
                    if(typeof noEventSupportedActionConfigurations === "object"){
                        actionConfigurations = JSON.stringify(noEventSupportedActionConfigurations);
                    }
                    
                    const { recommender, recommendedBy } = result.actionDetails.attributes;
                    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                        viewportElementId: 'viewport_1',
                        route: 'guidance',
                        fields: { "recommender": recommender, "recommendedBy": recommendedBy },
                        params: { "isFullSearchView": true , "actionConfigurations": noEventSupportedActionConfigurations}
                    });
                    updateSelectedSearchResult(selectedActionId);
                }
            }
        }).catch(error => {
            api.setState('isLoading', false);
            console.log('Start API Error: ', error);
        });

    };

    const updateSelectedSearchResult = (selectedActionId = '') => {
        let searchActionsCardDataObj = { ...api.state.searchResults };
        let items = searchActionsCardDataObj.items.map(searchObj => {
            let actionDetailId = searchObj.propValues.actionDetailId;
            searchObj.propValues.isSelected = !!actionDetailId && actionDetailId === selectedActionId;
            return searchObj;
        });
        searchActionsCardDataObj.items = items;
        api.setState('searchResults', searchActionsCardDataObj);
    };

    const showRecommendationCompletionMessage = (result) => {
        var completionMessage = result.completionMessage ? result.completionMessage : '';
        var notificationItem = {
            id: "nba_completed",
            type: "success",
            message: completionMessage,
            action: {
                type: "dismiss"
            },
        };
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [
                notificationItem
            ],
        });
        helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: "nba_completed"
            }]
        }), 5000);
    };

    const showRecommendationErrorMessage = async (result) => {
        var message = await helpers.translate('This action couldn’t be completed due to an error. Contact your ServiceNow administrator about this situation.');
        if (result.actionDetails && result.actionDetails.actionStatus == 'error') {
            message = result.actionDetails && result.actionDetails.errorMessage ? result.actionDetails.errorMessage : message;
        }
        var notificationItem = {
            id: "nba_errored",
            status: "critical",
            icon: "circle-info-outline",
            content: {
                type: "html",
                value: "<span>" + message + "</span>",
            },
            action: {
                type: "dismiss"
            },
        };
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [
                notificationItem
            ],
        });
        helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: notificationItem.id
            }]
        }), 5000);
    };

    const hideCurrentAction = (searchResults, result) => {
        var searchResults = { ...searchResults};
        var items = searchResults.items.filter((searchActionObj) => searchActionObj.propValues.actionDetailId != result.actionDetails.actionDetailId);
        searchResults.items = [...items];
        api.setState('searchResults', searchResults);
    };

    const getResultCountMessage = (currentPage, items, itemsPerPage, totalCount) => {
        const geniusItems = items.filter(item => item.propValues.isGenius === true);
        const searchCount = items.length - geniusItems.length;
        if (searchCount == 0) {
            return `Showing 0 of ${totalCount}`;
        }
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        let endIndex = startIndex + searchCount - 1;
        if (endIndex > totalCount) {
            endIndex = totalCount;
        }

        return `Showing ${startIndex} - ${endIndex} of ${totalCount}`;
    };

    return {
        handleSearchEvents: handleSearchEvents,
        handleSearchResultActions: handleSearchResultActions,
    }
}
