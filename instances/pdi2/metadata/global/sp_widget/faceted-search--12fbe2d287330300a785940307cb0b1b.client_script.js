function($scope, $sce, $location, spUtil, $element, $timeout, $rootScope, spFacetsClientService, spFacetManager, $window, spAriaUtil, snAnalytics, $http, i18n, spAISearchResults) {
    var c = this;
    var regExpr = /id=.+/;
    var loadingMsg = i18n.getMessage("Loading");

    function pageChanged(newUrl, oldUrl) {
        var newUrlParams = newUrl.match(regExpr),
            oldUrlParams = oldUrl.match(regExpr);

        if (!newUrlParams && !oldUrlParams) {
            return false;
        }

        if ((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
            return true;
        }

        return newUrlParams[0].split("&")[0] !== oldUrlParams[0].split("&")[0];
    }

    $scope.$on('$scrollToResultsTop', scrollToResultsTop);

    function scrollToResultsTop() {
        var scrollableSection = $('.sp-scroll');
        if (scrollableSection.length)
            scrollableSection[0].scrollTo(0, 0);
    }

    if (!c.data.aisEnabled) {
        var url = null;

        $scope.sendAnalytics = function(item, index) {
            var payload = {};
            payload.name = "Search Result Selected";
            payload.data = {};
            payload.data["Keyword"] = $scope.data.q;
            payload.data["Item"] = item.label;
            payload.data["Rank"] = index + 1;
            payload.data["SysID"] = item.sys_id;
            snAnalytics.addEvent(payload);
        };

        spUtil.setSearchPage($scope.data.t);
        $scope.isLoading = true;
        $scope.geniusResultsTemplates = [];
        $scope.hasFacet = false;
        spAriaUtil.sendLiveMessage(loadingMsg, "status");
        $scope.isFilterMenuLoading = true;
        $scope.showPagination = false;
        $scope.showFilterMenu = false;
        $scope.isFilterApplied = spFacetManager.isAnyFacetSelected();
        $scope.showApply = false;
        $scope.collpaseFacets = !$scope.data.t || $scope.data.t == "";
        $scope.latitude = null;
        $scope.longitude = null;
        $scope.isLocationTrackerDisabled = $scope.data.isLocationTrackerDisabled === "true";

        $scope.getBGImage = function(item) {
            return {
                "background-image": "url('" + item.picture + "')"
            };
        }

        $scope.search = function(searchTerm) {
            $location.search('q', searchTerm);
        }

        $scope.clearAll = function() {
            spFacetManager.clearAllFacet();
            $scope.isFilterApplied = false;
        }

        $scope.fetchMoreResults = function(query_start_location) {
            fetch(query_start_location);
        }

        $scope.openFilterMenu = function() {
            url = $location.url();
            $scope.showApply = false;
            $scope.showFilterMenu = true;
            setFocusOnFilterResultpage();
        }

        $scope.cancel = function() {
            if (url) {
                $location.url(url);
            }
            $scope.showFilterMenu = false;
        }

        $scope.apply = function() {
            $scope.showFilterMenu = false;
            setFocusOnFilter();
        }

        fetch(0);

        $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);

        $scope.escapeHTML = function(value) {
            var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;'
            };
            if (!value) return value;
            value = String(value).replace(/[&<>"'\/]/g, function(s) {
                return entityMap[s];
            });

            return value;
        }

        $scope.highlight = function(haystack, needle) {
            if (!haystack)
                return "";

            if (!needle)
                return haystack;

            return haystack.replace(new RegExp(needle.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "gi"), function(match) {
                return '<mark class="highlight mark">' + match + '</mark>';
            });
        }

        $scope.smallScreenSize = isSmallScreenSize();

        function isSmallScreenSize() {
            return $window.matchMedia('(max-width: 767px)').matches;
        }

        angular.element($window).on('resize', function() {
            $scope.smallScreenSize = isSmallScreenSize();
        });

        function onLocationChangeSuccess(event, newUrl, oldUrl) {
            if (pageChanged(newUrl, oldUrl))
                return;

            try {
                var oldQuery = new URL(oldUrl).searchParams.get("q");
                var newQuery = new URL(newUrl).searchParams.get("q");
                if (oldQuery === newQuery)
                    $window.spSearchAnalytics = {
                        refinement_occurred: spFacetManager.isAnyFacetSelected()
                    };
            } catch (e) {}
            fetch();
        }

        function getResultDescription(result) {
            return result.name || result.primary || result.sec_title;
        }

        function trackSearchResultClicked(rank) {
            if (!rank || rank < 1) return;
            var c = $scope.c;
            var result = $scope.results[rank - 1];
            var sourceTable = result.table || null;

            var payloadObject = {
                action: "GlideSPSearchAnalytics",
                payload: {
                    query: c.data.q,
                    portal_id: c.data.portalID,
                    result_event_sys_id: result.sys_id,
                    label_description: getResultDescription(result),
                    source_table: sourceTable,
                    signal_type: "CLICK",
                    signal_value: rank
                }
            };
            c.server.get(payloadObject);
        }

        // Event delegation for Updating click rank
        $element.on('click', '.result-item a', function(e) {
            var index = $(e.currentTarget).closest('[data-index]').data('index');
            trackSearchResultClicked(index + 1);
        });

        function getSearchSources($scope) {
            var c = $scope.c;
            var urlParams = $location.search();
            var sources = {};
            Object.keys(c.data.searchSources).map(function(key) {
                if (!urlParams.t) // all sources
                    sources[key] = 0;
                else // single source
                    sources[urlParams.t] = 0;
            });
            $scope.results.map(function(item) {
                var sourceId = _.get(item, '__search_source_id__');
                if (sources[sourceId])
                    sources[sourceId]++;
                else
                    sources[sourceId] = 1;
            });
            var searchSources = [];
            Object.keys(sources).map(function(key) {
                var source_id = c.data.searchSourceConfiguration[key];
                searchSources.push({
                    source_id: source_id,
                    number_of_results: sources[key]
                });
            });
            return searchSources;
        }

        function getSearchResultsSignals($scope) {
            return $scope.results.map(function(item) {
                return {
                    record_id: item.sys_id,
                    table_name: item.table
                };
            });
        }

        function setUserLocationCoords(cb) {
            var onSuccess = function(pos) {
                return cb({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                })
            };

            var onError = function() {
                return cb({
                    latitude: null,
                    longitude: null
                });
            };

            if (window.navigator.geolocation) {
                window.navigator.geolocation.getCurrentPosition(onSuccess, onError, {
                    enableHighAccuracy: true
                });
            }
        }

        if (!$scope.isLocationTrackerDisabled) {
            setUserLocationCoords(function(coords) {
                $scope.latitude = coords.latitude;
                $scope.longitude = coords.longitude;
            });
        }

        function trackSearchEvent() {
            var c = $scope.c;
            var refinement_occurred = _.get($window, 'spSearchAnalytics.refinement_occurred', false);

            var payload = {
                query: c.data.q,
                portal_id: c.data.portalID,
                page_id: _.get($window, 'spSearchAnalytics.page_id', $scope.page.id),
                refinement_occurred: refinement_occurred,
                browser_info: $window.navigator.userAgent,
                location: {
                    latitude: $scope.latitude,
                    longitude: $scope.longitude
                }
            }

            if (!refinement_occurred) {
                payload.search_results = getSearchResultsSignals($scope);
                payload.results_per_source = getSearchSources($scope);
            }

            var payloadObject = {
                action: "GlideSPSearchAnalytics",
                payload: payload
            };

            c.server.get(payloadObject);
        }

        function fetch(query_start_location) {
            $scope.isLoading = true;
            spAriaUtil.sendLiveMessage(loadingMsg, "status");
            $scope.isFilterMenuLoading = true;
            $scope.showApply = true;
            var urlParams = $location.search();

            $scope.limit = urlParams.t ? $scope.data.limit_group : $scope.data.limit_all;
            $scope.data.q = urlParams.q;
            $window.document.title = $scope.data.q + ' ' + $scope.page.static_title + (!$scope.portal.hide_portal_name ? ' - ' + $scope.portal.title : '');
            var params = {
                    query: urlParams.q,
                    query_start_location: query_start_location,
                    count: $scope.limit,
                    source: urlParams.t,
                    portal: $rootScope.portal_id,
                    page: $rootScope.page && $rootScope.page.sys_id || "",
                    include_facets: false
                },
                additionalQuery = getAdditionalQuery(urlParams);

            if (!isAllSearchSource(urlParams)) {
                $scope.collpaseFacets = false;
                if ($scope.data.searchSources[urlParams.t]) {
                    $scope.t_label = $scope.data.searchSources[urlParams.t].name;
                }
                $scope.showFilterIcon = true;
            } else {
                $scope.t_label = "${All}";
                $scope.showFilterIcon = false;
                $scope.collpaseFacets = true;
            }

            params.include_suggestions = $scope.options.show_did_you_mean == "true" || params.include_suggestions;

            if (urlParams.t && additionalQuery !== "") {
                params.additionalQuery = additionalQuery;
            }

            spFacetsClientService.search(params).then(function(response) {
                if (!response) {
                    $scope.hasFacet = false;
                    return;
                }
                if (response.data.result.results.length > 0 || (params.additionalQuery && params.additionalQuery !== "")) {
                    var allSearchSourceResults = [].concat(response.data.result.results, response.data.result.additionalResults)
                    getFacets(params, allSearchSourceResults);
                } else {
                    $scope.isFilterMenuLoading = false;
                    $scope.hasNotications = (response.data.result.$$uiNotification.length > 0) ? true : false;
                    spFacetManager.notify(response);
                    $scope.hasFacet = false;
                }
                var searchResults = response.data.result.results.map(function(result) {
                    if (result.portal == 'catalog' && result.legacy) {
                        var parentTable = null;
                        var parentSysId = null;
                        if ($window.frameElement) {
                            parentTable = $window.frameElement.dataParentTable;
                            parentSysId = $window.frameElement.dataParentSysId;
                        }
                        if (parentTable && parentSysId) {
                            result.url = result.url + '&sysparm_parent_sys_id=' + parentSysId + '&sysparm_parent_table=' + parentTable;
                        }
                    }
                    result.templateID = "sp-search-source-" + result.__search_source_id__ + ".html";
                    return result;
                });
                var nextFocusIndex = 0;
                if (query_start_location > 0) {
                    $scope.results = $scope.results.concat(searchResults);
                    nextFocusIndex = $scope.results.length - searchResults.length;
                } else {
                    $scope.results = searchResults;
                    $scope.$emit('$scrollToResultsTop');
                }

                $scope.isLoading = false;

                if (response.data.result.pagination_supported) {
                    if (searchResults.length > 0)
                        generatePagination(searchResults, nextFocusIndex);
                    else
                        $scope.showLoadMore = false;
                } else {
                    $scope.showPagination = false;
                }

                if (response.data.result.suggestions)
                    $scope.data.suggestions = response.data.result.suggestions;

                generateAndSendAriaLiveMessage(params);
                trackSearchEvent();
            });

            $scope.isFilterApplied = spFacetManager.isAnyFacetSelected();
            if (!$window.facetId && !query_start_location && spAriaUtil.isAccessibilityEnabled())
                setFocusSearchResult();
        }

        spFacetManager.subscribe("spFacets.refresh.data", "Pills", onFacetsData);


        function generateAndSendAriaLiveMessage(params) {
            var count = $scope.results.length;

            if (count === 0) {
                spAriaUtil.sendLiveMessage(i18n.getMessage(c.data.noResultsMsg));
            } else if (count === 1) {
                if (params.additionalQuery) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage('{0} ' + c.data.resultFilterMsg).withValues([count]));
                } else if (!params.additionalQuery) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage('{0} ' + c.data.resultUnFilterMsg).withValues([count]));
                }
            } else {
                if (params.additionalQuery) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage('{0} ' + c.data.resultsFilterMsg).withValues([count]));
                } else if (!params.additionalQuery) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage('{0} ' + c.data.resultsUnFilterMsg).withValues([count]));
                }
                if ($scope.showPagination && $scope.showLoadMore) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage(c.data.paginationMsg));
                }
                if (count === $scope.limit && !scope.showPagination) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage(c.data.limitMsg));
                }
            }
        }


        function getFacets(params, searchResults) {
            var paramsCopy = JSON.parse(JSON.stringify(params))
            paramsCopy.include_facets = true;
            paramsCopy.include_suggestions = false;
            paramsCopy.searchResults = searchResults;

            spFacetsClientService.search(paramsCopy).then(function(response) {
                $scope.hasFacet = false;
                if (!response)
                    return;

                $scope.isFilterMenuLoading = false;
                $scope.hasFacet = hasFacet(response.data.result.facets, params.source);
                if (!response.data.result.pagination_supported)
                    $scope.endPagination = getEndPagination(searchResults, $scope.hasFacet);
            });
        }

        function isAllSearchSource(urlParams) {
            return !urlParams.t || urlParams.t == "";
        }

        $scope.skipToSearchResults = function() {
            focusSearchResultHeader();
        };

        function setFocusSearchResult() {
            $timeout(function() {
                if (!$scope.hasNotications)
                    focusSearchResultHeader();
            }, 2500);
        }

        function setFocusOnFilterResultpage() {
            $timeout(function() {
                var element = $element.find('button#cancel')[0];
                if (element)
                    element.focus();
            });
        }

        function focusSearchResultHeader() {
            var element = $element.find(".results-heading")[0];
            if (element) {
                element = angular.element(element);
                element.focus();
            }
        }

        function setFocusNextItem(index) {
            $timeout(function() {
                var element = $element.find(".result-item")[index];
                if (element) {
                    element = element.querySelector("a");
                    element = angular.element(element);
                    element.focus();
                }
            }, 500);
        }

        function generatePagination(results, previousIndex) {
            var last = results[results.length - 1];
            $scope.showPagination = true;
            $scope.showLoadMore = last && !last.isLastResult;
            $scope.query_start_location = (last && last.query_location != undefined) * (parseInt(last.query_location) + 1) || 0;

            if (previousIndex > 0) {
                setFocusNextItem(previousIndex);
            }
        }

        function hasFacet(facets, searchSource) {
            if (searchSource && searchSource !== "") {
                return facets && facets[searchSource] && facets[searchSource].length > 0
            } else {
                for (var key in facets) {
                    if (facets[key].length > 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        function getEndPagination(results, hasFacet) {
            if (results.length >= $scope.limit) {
                if (hasFacet) {
                    return "${Results are limited to }" + $scope.limit + "${ items per search. Try using filters or more specific keywords.}";
                }
                return "${Results are limited to }" + $scope.limit + "${ items per search. Try using more specific keywords.}";
            }

            return "${End of results}";
        }

        function getAdditionalQuery(params) {
            var paramsCopy = _.clone(params);

            delete paramsCopy.q;
            delete paramsCopy.t;
            delete paramsCopy.id;
            delete paramsCopy.spa;

            if (_.isEmpty(paramsCopy))
                return "";

            for (var key in paramsCopy) {
                if (paramsCopy.hasOwnProperty(key))
                    paramsCopy[key] = processURLProperty(paramsCopy[key]);
            }

            return paramsCopy;
        }

        function propertyIsArray(prop) {
            return prop.charAt(0) === '[' && prop.charAt(prop.length - 1) === ']';
        }

        function processURLProperty(property) {
            if (propertyIsArray(property)) {
                var properties = property.substring(1, property.length - 1).split(",");
                properties = properties.map(function(prop) {
                    return prop.split("%2C").join(",");
                });
                return properties;
            } else {
                return property;
            }
        }

        function findItems(facet, key, valueArr) {
            if (!Array.isArray(valueArr))
                valueArr = [valueArr];

            var items = facet.items.filter(function(item) {
                return valueArr.some(function(value) {
                    return value === item.value;
                })
            });

            if (items && items.length > 0) {
                return items;
            }

            return null;
        }

        function findFacet(facets, key) {
            var f = null;
            if (facets && facets.length > 0) {
                f = facets.filter(function(d) {
                    return d.id === key;
                });
            }

            if (f && f.length > 0) {
                return f[0];
            }

            return null;
        }

        function onFacetsData(params) {
            var query = params.query,
                facets = params.data[query.t],
                pills = {};

            var keys = Object.keys(query);
            keys.forEach(function(k) {

                var facet = findFacet(facets, k);
                if (facet) {
                    var items = findItems(facet, k, processURLProperty(query[k]));
                    if (items) {
                        items.forEach(function(item) {
                            if (!pills[item.label]) {
                                pills[item.label] = {
                                    id: k,
                                    label: item.label,
                                    facet: facet,
                                    item: item
                                };
                            } else {
                                //update previous pill
                                updatPreviousPill(pills, item.label);
                                //add current pill
                                var label = getLabel(facet, item);
                                pills[label] = {
                                    id: k,
                                    label: label,
                                    facet: facet,
                                    item: item
                                };
                            }
                        });
                    }
                }
            });
            $scope.data.pills = _.values(pills);
        }

        function getLabel(facet, item) {
            return item.label + " (" + facet.label + ")";
        }

        function updatPreviousPill(pills, label) {
            var previous = pills[label],
                updatedLabel = getLabel(previous.facet, previous.item);
            previous.label = updatedLabel;
            pills[updatedLabel] = previous;
            delete pills[label];
        }
    } else {
        var config = c.data.searchConfig;
        var inputConfig = config[0].inputValues;
        // Track whether we are still in the chat-originated search session
        c.isFromChatSession = !!$location.search().searchFromChat;
        // Hide synthesized GR for chat-originated session OR portals with premium/AINative chat enabled
        c.hideGeniusResults = c.isFromChatSession || c.data.isAINativeChatEnabled;
        var TAB_FILTER_ACTION = 'SN_TAB_FILTER#FILTER_SELECTED';
        var SEARCH_FACETS_ACTION = 'SN_SEARCH_FACETS#SELECTIONS_UPDATED';
        var SORT_FILTER_CLICKED = 'SN_SEARCH_RESULTS_CONTAINER#SORT_FILTER_SELECTED';
        var MOBILE_FACET_SORT_FILTER_SELECTED = 'SN_SEARCH_FACETS#SORT_FILTER_SELECTED';
        var SPELL_SEARCH_EXECUTED = 'SN_SEARCH_RESULTS_CONTAINER#SEARCH_EXECUTED';
        var DONE_BUTTON_CLICKED = 'SN_SEARCH_FACETS#DONE_BUTTON_CLICKED';
        var PAGINATION_BUTTON_CLICKED = 'SN_SEARCH_RESULTS_CONTAINER#PAGINATION_BUTTON_CLICKED';
        var DECLARATIVE_ACTION = 'SN_SEARCH_RESULTS_CONTAINER#DECLARATIVE_ACTION';
        var DECLARATIVE_ACTION_SCRIPT_START = 'DECLARATIVE_ACTION#SCRIPT_START';
        var DECLARATIVE_SCRIPT_SUCCESS = 'DECLARATIVE_ACTION#SCRIPT_SUCCESS';
        var DECLARATIVE_SCRIPT_FAILED = 'DECLARATIVE_ACTION#SCRIPT_FAILED';
        var SEARCH_START = 'SN_SEARCH_RESULTS_CONTAINER#SEARCH_START';
        var COLLAPSED_ATTACHMENT_CLICKED = 'SN_SEARCH_RESULTS_CONTAINER#COLLAPSED_ATTACHMENT_CLICKED';
        var CHAT_TRIGGERED = 'SN_SEARCH_TOP_RESULTS#CHAT_TRIGGERED';
        var CLICK = 'SN_SEARCH_TOP_RESULTS#TOP_RESULTS_ACTION_DELEGATED';
        var SEARCH_RESULTS_CHAT_TRIGGERED = 'SN_SEARCH_RESULTS_CONTAINER#CHAT_TRIGGERED';
        var HIDE_FACET_CLICKED = 'SN_SEARCH_FACETS#TOGGLE_FACET_PANEL_VISIBILITY';
		var SHOW_FACET_CLICKED = 'NOW_BUTTON_BARE#CLICKED';
        var KG_VIEW_RECORDS = 'SN_SEARACH_GENIUS_CARD_ASSIST#KG_VIEW_RECORDS';
        var SUBSCRIPTION_SUCCEEDED = 'SN_SEARCH_TOP_RESULTS#SUBSCRIPTION_SUCCEEDED';
        var sectionElement = $('section.page');

        c.data.showFacets = false;
        c.tabSwitched = false;
        $rootScope.$emit("sp.page.aiSearchLoad");
        $element.on('SN_TAB_FILTER#FILTER_SELECTED SN_SEARCH_RESULTS_CONTAINER#SORT_FILTER_SELECTED SN_SEARCH_FACETS#SELECTIONS_UPDATED SN_SEARCH_FACETS#SORT_FILTER_SELECTED SN_SEARCH_RESULTS_CONTAINER#SEARCH_EXECUTED SN_SEARCH_FACETS#DONE_BUTTON_CLICKED SN_SEARCH_RESULTS_CONTAINER#PAGINATION_BUTTON_CLICKED SN_SEARCH_RESULTS_CONTAINER#DECLARATIVE_ACTION DECLARATIVE_ACTION#SCRIPT_SUCCESS DECLARATIVE_ACTION#SCRIPT_FAILED DECLARATIVE_ACTION#SCRIPT_START SN_SEARCH_RESULTS_CONTAINER#SEARCH_START SN_SEARCH_TOP_RESULTS#CHAT_TRIGGERED SN_SEARCH_TOP_RESULTS#TOP_RESULTS_ACTION_DELEGATED SN_SEARCH_RESULTS_CONTAINER#CHAT_TRIGGERED SN_SEARCH_FACETS#TOGGLE_FACET_PANEL_VISIBILITY NOW_BUTTON_BARE#CLICKED SN_SEARACH_GENIUS_CARD_ASSIST#KG_VIEW_RECORDS SN_SEARCH_TOP_RESULTS#SUBSCRIPTION_SUCCEEDED', '.triggerActions', function(e) {

            switch (e.type) {
                case TAB_FILTER_ACTION:
                    inputConfig.searchFilters.value = e.detail.payload.selectedFilter;
                    inputConfig.paginationToken.value = null;
                    c.tabSwitched = true;
                    var payload = {
                        spa: '1',
                        searchFilters: JSON.parse(inputConfig.searchFilters.value)[0] || undefined,
                        facetFilters: null,
                        paginationToken: undefined
                    };
                    if (c.data.persistFacetsAcrossTabs) {
                        payload.facetFilters = inputConfig.facetFilters.value;
                    }
                    spAISearchResults.locationSearch(angular.extend($location.$$search, payload));
                    break;
                case MOBILE_FACET_SORT_FILTER_SELECTED:
                case SORT_FILTER_CLICKED:
                    inputConfig.sortOptions.value = e.detail.payload.selectedFilter;
                    inputConfig.paginationToken.value = null;
                    spAISearchResults.locationSearch(angular.extend($location.$$search, {
                        spa: '1',
                        sortOptions: JSON.parse(inputConfig.sortOptions.value)[0] || undefined,
                        facetFilters: inputConfig.facetFilters.value,
                        paginationToken: undefined
                    }));
                    break;
                case SEARCH_FACETS_ACTION:
                    inputConfig.facetFilters.value = e.detail.payload.selectedFilters;
                    inputConfig.paginationToken.value = null;
                    const urlParams = {
                        spa: '1',
                        facetFilters: inputConfig.facetFilters.value || undefined,
                        paginationToken: undefined
                    };
                    if (e.detail.payload.sourceFilters) {
                        const searchFilters = JSON.parse(e.detail.payload.sourceFilters).join(',');
                        urlParams['searchFilters'] = searchFilters ? searchFilters : undefined;
                    };
                    spAISearchResults.locationSearch(angular.extend($location.$$search, urlParams));
                    break;
                case DONE_BUTTON_CLICKED:
                    c.toggleFilter(true);
                    setFocusOnFilter();
                    break;
                case SPELL_SEARCH_EXECUTED:
                    inputConfig.disableSpellCheck.value = 'true';
                    inputConfig.paginationToken.value = null;
                    inputConfig.facetFilters.value = '';
                    inputConfig.searchTerm.value = e.detail.payload.searchTerm;
                    spAISearchResults.locationSearch(angular.extend($location.$$search, {
                        spa: '1',
                        disableSpellCheck: inputConfig.disableSpellCheck.value,
                        facetFilters: inputConfig.facetFilters.value,
                        paginationToken: inputConfig.paginationToken.value,
                        sortOptions: inputConfig.sortOptions.value,
                        q: inputConfig.searchTerm.value
                    }));
                    break;
                case PAGINATION_BUTTON_CLICKED:
                    inputConfig.paginationToken.value = e.detail.payload.paginationToken;
                    spAISearchResults.locationSearch(angular.extend($location.$$search, {
                        spa: '1',
                        paginationToken: inputConfig.paginationToken.value || undefined
                    }));
                    $scope.$emit('$scrollToResultsTop');
                    break;
                case DECLARATIVE_ACTION:
                    var payload = e.detail.payload;
                    var actionObj = e.detail.payload.action;
                    var actionPayload = actionObj.actionPayload;
                    var analyticsPayload = e.detail.payload.analyticsPayload;
                    if (analyticsPayload)
                        snAnalytics.addEvent(analyticsPayload);
                    if (!_.isEmpty(actionPayload) && !(actionObj.href))
                        spAISearchResults.navigate(c.data, actionPayload, actionObj, payload);
                    break;
                case KG_VIEW_RECORDS:
                    var actionPayload = e.detail && e.detail.payload && e.detail.payload.action && e.detail.payload.action.actionPayload;
                    if (!actionPayload || !actionPayload.table) break;

                    function normalizeEncodedQuery(query) {
                        if (!query) return "";
                        try {
                            var decodedQuery = decodeURIComponent(query);
                            // If decode did not change it, it was plain already
                            return decodedQuery === query ? query : decodedQuery;
                        } catch (e) {
                            return query;
                        }
                    }

                    var url = new URL(window.location.origin + window.location.pathname);
                    url.search = '';
                    url.searchParams.set('id', 'list');
                    url.searchParams.set('table', actionPayload.table);
                    url.searchParams.set('filter', normalizeEncodedQuery(actionPayload.encoded_query));

                    window.open(url.href, '_blank');
                    break;
                case SEARCH_START:
                    var analyticsPayload = e.detail.payload.analyticsPayload || e.detail.payload;
                    if (analyticsPayload)
                        snAnalytics.addEvent(analyticsPayload);
                    break;
                case DECLARATIVE_SCRIPT_SUCCESS:
                case DECLARATIVE_SCRIPT_FAILED:
                    var notificationsList = [];
                    var notificationsFromPayload = e.detail.payload.session && e.detail.payload.session.notifications;
                    $scope.$emit('$$uiNotification', notificationHandler(notificationsFromPayload, notificationsList));
                    break;
                case COLLAPSED_ATTACHMENT_CLICKED:
                    var attachmentAnalyticsPayload = e.detail.payload.analyticsPayload;
                    if (attachmentAnalyticsPayload)
                        snAnalytics.addEvent(attachmentAnalyticsPayload);
                    break;
                case CLICK:
                    var payload = e.detail.payload;
                    payload.openInNewTab = true;
                    var actionObj = e.detail.payload.action;
                    var actionPayload = actionObj.actionPayload;
                    var analyticsPayload = e.detail.payload.analyticsPayload;
                    if (analyticsPayload)
                        snAnalytics.addEvent(analyticsPayload);

                    if (!_.isEmpty(actionPayload))

                        spAISearchResults.navigate(c.data, actionPayload, actionObj, payload);
                    break;
                case CHAT_TRIGGERED:
                    var searchContext = e.detail.payload;
                    searchContext.selectedItem.type = 'genius';
                    var transferred_search_result = {};
                    transferred_search_result.searchContext = searchContext
                    $window.nowAssistDynamicWindow
                        .open({
                            context: {
                                transferred_search_result: JSON.stringify(transferred_search_result)
                            },
                            forceNewConversation: true
                        });
                    break;
                case SEARCH_RESULTS_CHAT_TRIGGERED:
                    var searchContext = e.detail.payload;
                    searchContext.selectedItem.type = 'regular';
                    var transferred_search_result = {};
                    transferred_search_result.searchContext = searchContext
                    $window.nowAssistDynamicWindow
                        .open({
                            context: {
                                transferred_search_result: JSON.stringify(transferred_search_result)
                            },
                            forceNewConversation: true
                        });
                    break;
                case HIDE_FACET_CLICKED:
                    c.toggleFacetPanel(e.detail.payload.facetPanelIsHidden);
                    break;
                case SHOW_FACET_CLICKED:
                	c.toggleFacetPanel(e.detail.payload.facetPanelIsHidden);
                    break;
                case SUBSCRIPTION_SUCCEEDED:
                    var asyncParams = JSON.parse(inputConfig.asyncParams.value);
                    asyncParams.clientReady = true;
                    inputConfig.asyncParams.value = JSON.stringify(asyncParams);
                    break;
                default:

            }

        });

        function notificationHandler(notificationsFromPayload, notificationsList) {
            for (var i = 0; i < notificationsFromPayload.length; i++) {
                notificationsList.push({
                    message: notificationsFromPayload[i].text,
                    type: notificationsFromPayload[i].type
                });
            }
            return notificationsList;
        }

        function onLocationChangeSuccess(event, newUrl, oldUrl) {
            if (pageChanged(newUrl, oldUrl))
                return;
            var currentUrl = new URL(newUrl);
            var previousUrl = new URL(oldUrl);
            inputConfig.searchTerm.value = c.data.searchTerm = currentUrl.searchParams.get('q');
            inputConfig.facetFilters.value = currentUrl.searchParams.get('facetFilters');
            var tabValue = currentUrl.searchParams.get('searchFilters');
            if (tabValue)
                tabValue = tabValue.split(',');
            var sortOption = currentUrl.searchParams.get('sortOptions');
            inputConfig.searchFilters.value = tabValue ? JSON.stringify(tabValue) : '[]';
            inputConfig.sortOptions.value = sortOption ? JSON.stringify([sortOption]) : '[]';
            inputConfig.paginationToken.value = currentUrl.searchParams.get('paginationToken');
            inputConfig.disableSpellCheck.value = currentUrl.searchParams.get('disableSpellCheck');
            var isRefinement = false;
            if (previousUrl.searchParams.get('q') === currentUrl.searchParams.get('q'))
                isRefinement = true;

            // When user does a brand-new search, re-read searchFromChat from the live URL
            if (!isRefinement) {
                c.isFromChatSession = !!currentUrl.searchParams.get('searchFromChat');
                c.hideGeniusResults = c.isFromChatSession || c.data.isAINativeChatEnabled;
            }

            getResults(isRefinement);
            sectionElement.addClass('overflow-hidden');

        }
        $scope.screenSize = getScreenSize();

        function getScreenSize() {
            return $window.matchMedia('(max-width: 767px)').matches ? 'sm' : 'lg';
        }

        angular.element($window).on('resize', function() {
            scope.$apply(function() {
                $scope.screenSize = getScreenSize();
            });

        });

        $scope.isMobileFacets = false;
        c.toggleFilter = function(apply) {
            $scope.isMobileFacets = !$scope.isMobileFacets;
            if (apply)
                $scope.$apply();
        };
        $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);

		$scope.hideFacetPanel = false;
        c.toggleFacetPanel = function(toggleValue) {
            $scope.hideFacetPanel = toggleValue;
            $scope.$apply();
        }

        // Fetch search results on load
        getResults(false);
        $scope.$evalAsync(function() {
            $('div.ais-breadCrumbs li:last-child a').attr('aria-label', c.data.SEARCH_RESULTS);
        });

        function getResults(isRefinement) {
            var treatAsRefinement = isRefinement && !c.data.filterGeniusResultsBySource; // Respect configuration on Search Application					
            c.sensitivityFilter = false;
            var url = spUtil.getHost() + '/api/now/uxf/databroker/exec';
            var containsFacets = false;
            c.isLoading = true;
            var searchConfig = config;

            if (treatAsRefinement) {
                // Request only search results on refinements
                searchConfig = JSON.parse(JSON.stringify(config));
                searchConfig.forEach(item => item.inputValues.searchPurview.value = "REGULAR");
            } else {
                // Suppress GR spinner when we know GR won't be returned (chat-originated session or AINative chat portal)
                c.isGeniusResultLoading = !c.hideGeniusResults;
                // Drive search purview accordingly
                searchConfig.forEach(function(item) {
                    item.inputValues.searchPurview.value = c.hideGeniusResults ? "REGULAR" : "ALL";
                });
            }
            $http.post(url, searchConfig).then(function(response) {
                sectionElement.removeClass('overflow-hidden');
                c.results = response.data.result[0].executionResult;
                c.isLoading = false;
                c.data.searchMetadata = c.results.searchMetadata;
                updateTitleAndResults();
                if (!treatAsRefinement) {
                    // Update Genius Result variables on new searches
                    c.geniusResultsTemplates = response.data.result[0].executionResult.geniusResultsTemplates;
                    c.geniusResultMetadata = c.results.searchMetadata.searchResultMetadata;
                    c.isGeniusResultLoading = false;
                    c.sensitivityFilter = c.results.searchMetadata.searchResultMetadata.sensitivityFilter ? c.results.searchMetadata.searchResultMetadata.sensitivityFilter.hasMatch : false;
                }
                if (c.results.searchMetadata) {
                    c.data.facetsData = c.data.searchMetadata.searchFacets;
                    if (c.data.searchMetadata.appliedFacetFilters.length > 0)
                        c.data.showFacets = containsFacets = true;
                    else {
                        for (var j = 0; j < c.data.facetsData.length; j++) {
                            if (c.data.facetsData[j].data.count) {
                                c.data.showFacets = containsFacets = true;
                                break;
                            }
                        }
                    }
                    c.data.showFacets = containsFacets && c.data.showFacets;

                }

            });
        }

        function updateTitleAndResults() {
            c.data.selectedTab = '';
            var count = 0;
            var resultMsg;
            var additionalMsg = '';
            var correctedTerm = '';
            if (!c.data.searchMetadata)
                return;

            var filtersData = c.data.searchMetadata.filters || [];
            for (var i = 0; i < filtersData.length; i++) {
                if (filtersData[i].sysId == $location.search().searchFilters) {
                    c.data.selectedTab = filtersData[i].label;
                    break;
                }
            }
            $window.document.title = (c.data.selectedTab ? (c.data.selectedTab + ' | ') : '') + $scope.page.static_title + (!$scope.portal.hide_portal_name ? ' - ' + $scope.portal.title : '');
            if (c.results.geniusResultsTemplates && c.results.geniusResultsTemplates.items)
                count = c.results.geniusResultsTemplates.items.length;
            if (c.results.searchResultsTemplates && c.results.searchResultsTemplates.items)
                count = count + c.results.searchResultsTemplates.items.length;
            resultMsg = (count == 1 ? 'result' : 'results') + ' returned';
            if (c.results.searchMetadata && c.results.searchMetadata.searchResultMetadata && c.results.searchMetadata.searchResultMetadata.correctedSearchTerm) {
                additionalMsg = ' for the corrected search term ';
                correctedTerm = c.results.searchMetadata.searchResultMetadata.correctedSearchTerm;
            }
            if (c.tabSwitched) {
                spAriaUtil.sendLiveMessage(i18n.getMessage('{0} {1} ' + resultMsg + additionalMsg + '{2}').withValues([count, c.data.selectedTab, correctedTerm]));
                c.tabSwitched = false;
            } else
                spAriaUtil.sendLiveMessage(i18n.getMessage('{0} ' + resultMsg + additionalMsg + '{1}').withValues([count, correctedTerm]));
        }


    }

    function setFocusOnFilter() {
        var delay = c.data.isMobile ? 15 : 0;
        $timeout(function() {
            if (!c.data.aisEnabled)
                var element = $element.find('button#filter_icon');
            else
                var element = $element.find('.ais-mobile-facets');

            if (element) {
                element = angular.element(element);
                element.focus();
            }
        }, delay);
    }

}
