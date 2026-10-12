function($http, $location, spAriaUtil, $window, $scope, $rootScope, $element, spAriaFocusManager, snAnalytics, spAISearchResults, $timeout) {
    var c = this;
    var data = c.data;

    c.ensureNowAssistSelfServiceIsLoaded = (function() {
        var loadingScript = document.head.querySelector('#nowAssistSelfServiceScript');

        if (window.nowAssistDialogOpened) {
            c.data.displayOnboardingPopover = false;
        }

        return function() {
            if (loadingScript) {
                return loadingScript; // Return existing promise if already loading
            }

            loadingScript = new Promise((resolve, reject) => {
                const flushTimeStamp = data.flushTimeStamp;

                const nowAssistSelfServiceScript = document.createElement('script');
                nowAssistSelfServiceScript.id = 'nowAssistSelfServiceScript';
                nowAssistSelfServiceScript.src = '/uxasset/externals/now-assist-self-service/index.jsdbx?sysparm_use_cache_buster=true&' +
                    'uxpcb=' + flushTimeStamp;
                nowAssistSelfServiceScript.type = 'module';

                nowAssistSelfServiceScript.onload = function() {
                    resolve(); // Resolve the promise when the script loads
                };

                nowAssistSelfServiceScript.onerror = function() {
                    reject(new Error('Failed to load script')); // Reject on error
                };


                document.head.appendChild(nowAssistSelfServiceScript); // Append script to head
            });

            return loadingScript; // Return the promise
        };
    })();

    function setSearchTerm(newUrl, oldUrl) {
        try {
            var oldQuery = new URL(oldUrl).searchParams.get("q");
            var newQuery = new URL(newUrl).searchParams.get("q");
            if (oldQuery === newQuery)
                return;
            if (c.data.aisEnabled)
                c.data.q = newQuery;
            else
                c.searchTerm = newQuery;
        } catch (e) {}
    }

    var regExpr = /[?&](t=[^&]+)/;

    function setOnBoardingPopover() {
        c.data.displayOnboardingPopover = false;
    }

    function onLocationChangeSuccess(event, newUrl, oldUrl) {
        if (!c.data.aisEnabled && c.searchSourceChanged(newUrl, oldUrl)) {
            var newUrlParams = newUrl.match(regExpr);
            if (!newUrlParams)
                c.searchType = null;
            else
                c.searchType = newUrlParams[1].substring(2);
        }
        setSearchTerm(newUrl, oldUrl);
    }
	if (c.data.isAINativeChatEnabled) {
        $timeout(function() {
            var lbfOmnibar = $element[0].querySelector('#sp-lbf-omnibar');
            if (!lbfOmnibar) return;

            // Angular re-links the widget on every portal home return. Without
            // this guard, listeners stack on the shared omnibar element and LBF
            // client roots pile up on the EventAPI bus.
            if (lbfOmnibar.__lbfOmniBarNavWired) return;
            lbfOmnibar.__lbfOmniBarNavWired = true;

            // Navigate optimistically on conversation:create-start (fires before
            // the conv-server round trip). ai-native-chat-widget backfills
            // conversation_id via history.replaceState on conversation:created.
            function onChatEvent(event) {
                var detail = event.detail || {};
                if (detail.type !== 'conversation:create-start') return;

                $rootScope.$applyAsync(function() {
                    var navigateToUrl = $location.search({
                        id: 'ai_native_chat',
                        spa: '1',
                        pending_conversation: '1'
                    });
                    spAriaFocusManager.navigateToLink(navigateToUrl.url());
                });
            }
            lbfOmnibar.addEventListener('now:chat:event', onChatEvent);

            var aielSub = null;
            var aielApplied = false;

            function buildSession(session, ctx) {
                return {
                    authToken: session.authToken || '',
                    userId: session.userId || '',
                    instanceName: session.instanceName || '',
                    pageContext: ctx.pageContext || {},
                    customContext: ctx.customContext || {},
                    widgetContext: ctx.customWidgetContext || {},
                    clientToolContext: ctx.clientToolContext || {},
                    forceNewConversation: false,
                    // Omitted rather than sent empty when the instance is not
                    // domain separated, so the client keeps treating the domain
                    // as unknown instead of comparing against a blank value.
                    domain: c.data.sessionDomain || undefined
                };
            }

            function applyAielSession(session, ctx) {
                if (aielApplied) return;
                aielApplied = true;
                lbfOmnibar.setSession({ session: buildSession(session, ctx) });
                if (aielSub && aielSub.unsubscribe) aielSub.unsubscribe();
                aielSub = null;
            }

            customElements.whenDefined('now-lbf-chat-client').then(function() {
                var aiexGlobals = window.__AIEX_GLOBALS__;
                if (!aiexGlobals || !aiexGlobals.subscribeToEvent) {
                    console.warn('[Typeahead Search] __AIEX_GLOBALS__ not available, AIEL may have failed to load');
                    return;
                }

                aiexGlobals.updatePageContext({
                    nowAssistDeploymentId: data.nowAssistDeploymentId,
                    deploymentDocumentId: data.deploymentId,
                    deploymentDocumentTable: 'sp_portal',
                    experienceName: 'portal',
                    portal: data.portalSuffix,
                    pageType: 'Angular',
                    type: 'other'
                });

                aielSub = aiexGlobals.subscribeToEvent('aiel:sessionUpdated', function(evt) {
                    if (!evt.session || !evt.session.authToken) return;
                    applyAielSession(evt.session, evt);
                });

                // PKCE may have completed before we subscribed.
                var initial = aielSub && aielSub.initialContext;
                if (initial && initial.session && initial.session.authToken) {
                    applyAielSession(initial.session, initial);
                }
            });

            $scope.$on('$destroy', function() {
                lbfOmnibar.removeEventListener('now:chat:event', onChatEvent);
                if (aielSub && aielSub.unsubscribe) aielSub.unsubscribe();
                aielSub = null;
                lbfOmnibar.__lbfOmniBarNavWired = false;
            });
        }, 0);
    } else {
        // Code common for Zing and AI Search start
        $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);
        $rootScope.$on('WIDGET_NOW_ASSIST_DIALOG_#OPENED', setOnBoardingPopover);
        if (c.data.aisEnabled)
            intializeAISearch();
        else
            initializeZingSearch();
    }

    	function getSearchResultConfiguration() {
		return c.options.search_results_configuration ||
			$location.search().search_results_configuration ||
			undefined;
	}

    function intializeAISearch() {
        // AI Search functions

        c.aisSubmit = function(payload) {
            var shouldReloadPage = c.data.refreshPageOnSearch && $location.search().id === 'search';
            if (payload.searchTerm) {
                var newUrlObj;
                if (c.data.nowAssistEnabled) {
                    newUrlObj = {
                        id: 'nowassistselfservice',
                        spa: '1',
                        query: payload.searchTerm,
                        new_chat: "true"
                    }
                } else {
                    newUrlObj = {
                        id: 'search',
                        spa: '1',
                        q: payload.searchTerm,
                        disableAllSuggestions: c.options.disable_all_suggestions && c.options.disable_all_suggestions.toString(),
                        search_application: c.options.search_application || undefined,
                        search_results_configuration: getSearchResultConfiguration(),
                        searchFilters: undefined,
                        disableSpellCheck: 'false'
                    };
                }

                if (c.data.isSearchFromChat) {
                    newUrlObj.searchFromChat = c.data.isSearchFromChat;
                }

                $rootScope.$applyAsync(function() {
                    var navigateToUrl = $location.search(newUrlObj);
                    if (shouldReloadPage)
                        $scope.$emit("sp.page.reload");
                    spAriaFocusManager.navigateToLink(navigateToUrl.url());
                });
            } else
                spAriaUtil.sendLiveMessage(c.data.emptySearchMessage);
        }

        c.navigate = spAISearchResults.navigate;

    }


    function initializeZingSearch() {
        c.options.glyph = c.options.glyph || 'search';
        c.options.title = c.options.title || c.data.searchMsg;
        c.options.color = c.options.color || "default";
        c.searchTerm = c.data.q;
        c.searchQuery = "";
        c.pageID = $scope.page && $scope.page.id;
        c.showSuggestions = c.data.searchTypeBehavior === "suggestions" && c.data.isSuggestionsEnabled === "true";
        c.suggestionsLimit = c.options.limit || "";
        c.latitude = null;
        c.longitude = null;
        c.isGlideSignalsLoaded = false;
        c.isLocationTrackerDisabled = c.data.isLocationTrackerDisabled === "true";
        c.isTypeAheadEnabled = c.data.isTypeAheadEnabled === "true";

        c.sendAnalytics = function(type) {
            var payload = {};
            payload.name = "Initiate Search";
            payload.data = {};
            payload.data["Keyword"] = (type == 'User Entered' ? c.searchTerm : c.searchQuery);
            payload.data["Type"] = type;
            payload.data["Page ID"] = c.pageID;
            snAnalytics.addEvent(payload);
        };
        if (c.isTypeAheadEnabled) {

            if (window.GlideSignals)
                initializeGlideSignals();
            else {
                $rootScope.$on("sp.defer_scripts.loaded", function() {
                    if (window.GlideSignals)
                        initializeGlideSignals();
                });
            }

            if (!c.isLocationTrackerDisabled) {
                setUserLocationCoords(function(coords) {
                    c.latitude = coords.latitude;
                    c.longitude = coords.longitude;
                });
            }
            c.searchType = c.data.searchType;

            // Zing Search functions
            function initializeGlideSignals() {
                if (!c.isLocationTrackerDisabled && window.GlideSignals.init)
                    window.GlideSignals.init();

                c.isGlideSignalsLoaded = window.GlideSignals.trackEvent || c.isGlideSignalsLoaded;
            }

            c.trackSuggestionsRenderedEvent = function(searchQueryLength, responseTimeInMilliSeconds) {
                if (c.isGlideSignalsLoaded)
                    GlideSignals.trackEvent('SEARCH_SUGGESTIONS_RENDERED', GlideSignals.priority.INFO, {
                        'applicationId': c.data.portalID,
                        'searchQueryLength': searchQueryLength,
                        'totalSuggestionsCount': c.totalSuggestionsCount,
                        'userHistorySuggestionsCount': c.userHistorySuggestionsCount,
                        'instanceHistorySuggestionsCount': c.instanceHistorySuggestionsCount,
                        'responseTime': responseTimeInMilliSeconds + ' ms'
                    });
            };

            c.trackSearchClickedEvent = function(model) {
                if (!c.isGlideSignalsLoaded)
                    return;

                if (c.showSuggestions) {
                    GlideSignals.trackEvent('SEARCH_SUGGESTION_CLICKED', GlideSignals.priority.INFO, {
                        'applicationId': c.data.portalID,
                        'searchQueryLength': c.searchQuery.length,
                        'suggestionClickedLength': model.name.length,
                        'totalSuggestionsCount': c.totalSuggestionsCount,
                        'suggestionClickedType': model.type,
                        'aggregatedClickIndex': getSearchItemIndex(c.searchItems, model),
                        'userHistorySuggestionsCount': c.userHistorySuggestionsCount,
                        'instanceHistorySuggestionsCount': c.instanceHistorySuggestionsCount,
                        'suggestionsDisplayLimit': c.suggestionsLimit,
                        'relativeClickIndex': getRelativeSearchItemIndex(c.searchItems, model)
                    })
                } else {
                    GlideSignals.trackEvent('SEARCH_TYPEAHEAD_CLICKED', GlideSignals.priority.INFO, {
                        'applicationId': c.data.portalID,
                        'searchQueryLength': c.searchQuery.length,
                        'typeaheadClickedLength': model.name && model.name.length,
                        'resultSysId': model.sys_id,
                        'clickIndex': model.query_location != null ? model.query_location : getSearchItemIndex(c.searchItems, model),
                        'sourceId': model.type != null ? model.type : model.table,
                        'typeaheadDisplayLimit': c.options.limit
                    })
                }
            }

            c.onSelect = function($item, $model, $label) {
                c.sendAnalytics(c.showSuggestions ? "Suggestions" : "Typeahead");
                c.searchTerm = ""; // prevents unexpected result if user quickly clicks search button after selecting
                if (c.showSuggestions)
                    $item.url = "?id=search&spa=1&q=" + encodeURIComponent($item.name);

                if (!$item.url || $item.url === "")
                    return;

                if (!c.showSuggestions) {
                    var index = $(".typeahead-popup li.active").data('index');
                    c.trackSearchResultClicked(index + 1);
                }

                c.trackSearchClickedEvent($model);

                if ($item.target)
                    window.open($item.url, $item.target);
                else {
                    var newUrl = $location.url($item.url);
                    spAriaFocusManager.navigateToLink(newUrl.url());
                }
            };

            function recordSuggestionsCount() {
                c.instanceHistorySuggestionsCount = 0;
                c.userHistorySuggestionsCount = 0;

                c.searchItems.forEach(function(item) {
                    var isInstanceHistory = item.type === 'INSTANCE_HISTORY';
                    c.instanceHistorySuggestionsCount += isInstanceHistory;
                    c.userHistorySuggestionsCount += !isInstanceHistory;
                });
            }

            function getSearchItemIndex(items, targetItem) {
                return (items || []).findIndex(function(item) {
                    return item.name === targetItem.name;
                });
            }

            function getRelativeSearchItemIndex(items, targetItem) {
                var groupedItems = (items || []).filter(function(item) {
                    return item.type === targetItem.type;
                });

                return getSearchItemIndex(groupedItems, targetItem);
            }

            c.getSearchSuggestions = function(query) {
                c.searchQuery = query;
                if ($location.search().q == c.searchQuery)
                    return;

                var payload = {
                    params: {
                        "sysparm_term": c.searchQuery,
                        "sysparm_sp_portal_id": c.data.portalID,
                        "sysparm_suggestions_limit": c.suggestionsLimit,
                        "sysparm_search_sources": c.data.searchSourceSysIds || ""
                    },
                    headers: {
                        'Accept': 'application/json'
                    }
                };

                var requestTimeStamp = new Date().getTime();
                return $http.get("/api/now/search/sp_suggestions", payload).then(function(response) {
                    var responseTimeStamp = new Date().getTime();
                    var responseTimeInMilliSeconds = (responseTimeStamp - requestTimeStamp);
                    var result = response.data.result;

                    c.totalSuggestionsCount = result != null ? result.entries.length : 0;
                    if (c.totalSuggestionsCount > 0)
                        sendLiveMessage(c.totalSuggestionsCount);

                    c.searchItems = result.entries.map(function(item) {
                        item.query = getQueryToHighlight(item, c.searchQuery);
                        item.glyph = getIcon(item.type);
                        item.term = item.name;
                        return item;
                    });

                    recordSuggestionsCount();
                    c.trackSuggestionsRenderedEvent(query.length, responseTimeInMilliSeconds);
                    return c.searchItems;
                });
            };

            function getSearchSources(results, c) {
                var sources = {};
                c.data.searchSources.map(function(key) {
                    sources[key] = 0;
                });
                results.forEach(function(item) {
                    if (sources[item.type])
                        sources[item.type]++;
                    else
                        sources[item.type] = 1;
                });
                var searchSources = [];
                Object.keys(sources).map(function(key) {
                    var source_id = c.data.searchSourceConfiguration[key] ? c.data.searchSourceConfiguration[key].sys_id : key;
                    searchSources.push({
                        source_id: source_id,
                        number_of_results: sources[key]
                    });
                });
                return searchSources;
            }

            function getSearchResultsSignals(results, c) {
                return results.map(function(item) {
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


            function getResultDescription(result) {
                return result.name || result.primary || result.sec_title;
            }

            c.trackSearchResultClicked = function(rank) {
                if (!rank || rank < 1) return;
                var query = c.latestQuery;
                var results = _.get(c.data, 'results', []);
                var result = results[rank - 1];
                var sourceTable = result.table || null;

                var payloadObject = {
                    action: "GlideSPSearchAnalyticsUpdateRank",
                    payload: {
                        query: query,
                        portal_id: this.data.portalID,
                        page_id: this.pageID,
                        results_per_source: getSearchSources(results, this),
                        search_results: getSearchResultsSignals(results, this),
                        refinement_occurred: false,
                        signal_type: "CLICK",
                        signal_value: rank,
                        browser_info: $window.navigator.userAgent,
                        location: {
                            latitude: c.latitude,
                            longitude: c.longitude
                        },
                        result_event_sys_id: result.sys_id,
                        label_description: getResultDescription(result),
                        source_table: sourceTable
                    }
                };

                $window.spSearchAnalytics = {
                    query: query
                };
                c.server.get(payloadObject);
            }

            c.getResults = function(query) {
                c.searchQuery = query;
                var payload = {
                    "query": c.searchQuery,
                    "portal": c.data.portalID,
                    "page": c.pageID,
                    "source": c.data.searchSources,
                    "include_facets": false,
                    "searchType": "typeahead"
                };


                if (c.options.limit || c.options.limit == 0)
                    payload.count = c.options.limit;

                return $http.post("/api/now/sp/search?sysparm_cancelable=true", payload).then(function(response) {
                    // Prevents typeahead from displaying suggestions if queries from page and input are the same
                    if ($location.search().q == c.searchQuery)
                        return;

                    var result = response.data.result;
                    var resultCount = result != null ? result.results.length : 0
                    sendLiveMessage(resultCount);

                    c.data.results = result.results;
                    c.latestQuery = c.searchQuery;

                    c.searchItems = result.results.map(function(item) {
                        var config = c.data.searchSourceConfiguration[item.__search_source_id__];

                        if (!item.url && config.linkToPage) {
                            item.url = "?id=" + config.linkToPage;
                            if (item.sys_id)
                                item.url += "&sys_id=" + item.sys_id;
                            if (item.table)
                                item.url += "&table=" + item.table
                        }

                        if (item.link)
                            item.url = item.link.indexOf('sys_attachment.do') != -1 ? item.link : config.linkToPage ? item.url : item.link;

                        if (config.type == "ADVANCED") {
                            item.templateID = config.template;
                        } else {
                            item.glyph = config.glyph;
                        }
                        return item;
                    });

                    if (c.searchItems.length == 0)
                        c.searchItems = [{
                            "primary": c.data.noResultsFoundMsg
                        }];
                    return c.searchItems;
                });
            }
        }
        c.searchSourceChanged = function(newUrl, oldUrl) {
            var newUrlParams = newUrl.match(regExpr),
                oldUrlParams = oldUrl.match(regExpr);

            if (!newUrlParams && !oldUrlParams) {
                return false;
            }

            if ((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
                return true;
            }

            return newUrlParams[1] !== oldUrlParams[1];
        }

        c.submitSearch = function() {
            c.sendAnalytics("User Entered");
            var shouldReloadPage = c.data.refreshPageOnSearch && $location.search().id === 'search';

            if (c.searchTerm) {
                var newUrl = $location.search({
                    id: 'search',
                    spa: '1',
                    t: c.searchType,
                    q: c.searchTerm
                });

                if (shouldReloadPage)
                    $scope.$emit("sp.page.reload");

                spAriaFocusManager.navigateToLink(newUrl.url());
                //Pass the current page ID to search page for Search Analytics
                $window.spSearchAnalytics = {
                    page_id: c.pageID
                };
            } else
                spAriaUtil.sendLiveMessage(c.data.emptySearchMessage);
        }

        function sendLiveMessage(resultCount) {
            spAriaUtil.sendLiveMessage(resultCount + " " +
                c.data.resultMsg + " " +
                (resultCount > 0 ? ' ' + c.data.navigationMsg : ''));
        }

        function getIcon(itemType) {
            return itemType === "INSTANCE_HISTORY" ? 'search' : 'clock-o';
        }

        function getQueryToHighlight(item, query) {
            return item.type === "INSTANCE_HISTORY" ? item.name.substring(query.length) : query;
        }
    }
}
