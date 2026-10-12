/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const dashboardUtils = imports["sn_notif_dashboard.NotificationDashboardUtils"](helpers);
    const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
    const {
        appliedFilters
    } = event.payload;

    //clear  filter is returning values as undefined and we need to change those values to empty array.
    if (appliedFilters) {
        appliedFilters.forEach(function(filter) {
            if (filter.type == 'choice' && filter.values == undefined) {
                filter.values = [];
            }
        });
    }

    switch (event.name) {
        case "MACROPONENT_PROPERTY_CHANGED":
            var {payload} = event;

        var pageProps = api.context.props;
           if (pageProps.freshpage && pageProps.freshpage == "false") {
                //this situation happens when user uses the filter and fetches the new results from server
                return;    
            } else {
                api.setState("debounceTimeoutId",({currentValue})=>{
                    let timeoutId = currentValue || null;
                    if (timeoutId) {
                        helpers.timing.clearTimeout(timeoutId);
                    }
                    timeoutId = helpers.timing.setTimeout(() => {
                        api.setState('debounceTimeoutId', null);
                        syncWithPageParameters();
                    }, 300);    
                    return timeoutId;
                });
            }
        break;
        case "NOW_BUTTON_BARE#CLICKED":
            setOverLayMessage(api.state.selectedTab, "onload");
            api.setState("parFilters", ({
                currentValue,
                api
            }) => {
                var parFilters = (currentValue || []).map(function(filter) {
                    var newFilter = { ...filter
                    };
                    if (newFilter.type == "choice") {
                        newFilter.values = [];
                    } else if (newFilter.type == 'date') {
                        newFilter.dynamicTimeRange = api.state.defaultDateFilter.dynamicTimeRange;
                        newFilter.start = api.state.defaultDateFilter.start;
                        newFilter.end = api.state.defaultDateFilter.end;
                    }
                    return newFilter;
                });
                setSelectedDateFilter(api.state.defaultDateFilter);
                api.setState("parFilters", parFilters);
                api.setState("state", "all");
                const criteria = {
                    filters: parFilters,
                    state: [],
                    type: []
                };
                clearAllTabResults();
                pullContent(api.state.selectedTab, criteria);
                return parFilters;
            });

            break;
        case "SN_COMPONENT_FILTER#APPLIED_ITEMS":
            if (!api.state.selectedTab)
                return;
            const updatedDateFilter = appliedFilters.find(function(filter) {
                return filter.type == "date";
            });
            if (updatedDateFilter && !updatedDateFilter.start)
                return;
            setOverLayMessage(api.state.selectedTab, "onload");
            dashboardUtils.normaliseDateFilter(updatedDateFilter, api.state.defaultDateFilter);
            api.setState("parFilters", ({
                currentValue,
                api
            }) => {

                if (api.state.isFirstBackendCall) {
                    var categoryFilter = {
                        "order": 9000,
                        "filterId": "1i87je9a8ir6bknr54tg",
                        "type": "choice",
                        "label": "Category",
                        "source": {
                            "payload": {
                                "primaryKey": "sys_id",
                                "table": "sys_notification_category"
                            },
                            "type": "table"
                        },
                        "values": [],
                        "include_unmatched_or_empty": false,
                        "apply_to": [
                            "sys_notification_category.sys_id"
                        ]
                    };
                    api.setState("InitialCategoryfilter", {...categoryFilter}); 
                    var categories = (api.context.props.categories || "").split(",");
                    categoryFilter.values = categoryFilter.values || [];
                    categories.forEach(function(value) {
                        if (value) {
                            categoryFilter.values.push(value);
                        }
                    });
                    appliedFilters.push(categoryFilter);
                }
                const {
                    parFilters,
                    encodedQueries
                } = mergePARFiltersV2(currentValue, appliedFilters);
                api.setState("encodedQueries", encodedQueries);

                if (!api.state.isFirstBackendCall) {
                    clearAllTabResults();
                    setSelectedDateFilter(parFilters.find(function(filter) {
                        return filter.type == "date";
                    }));

                } else {
                    //show default date
                    var pageParams = api.context.props;
                    var dateFilter = (appliedFilters || []).find(function(filter) {
                        return filter.type == "date";
                    });
                    if (dateFilter) {
                        var defaultFilter = {
                            start: dateFilter.start,
                            end: dateFilter.end,
                            dynamicTimeRange: dateFilter.dynamicTimeRange
                        };
                        api.setState("defaultDateFilter", defaultFilter);
                        //read the values from page parameters and update it
                        if (pageParams.startdate && pageParams.enddate && pageParams.dynamictimerange) {
                            dateFilter.start = pageParams.startdate;
                            dateFilter.end = pageParams.enddate;
                            dateFilter.dynamicTimeRange = pageParams.dynamictimerange;
                        }
                        setSelectedDateFilter(dateFilter);
                    }

                }
                const criteria = {
                    filters: parFilters,
                    state: api.state.state,
                    type: api.state.type
                };
                pullContent(api.state.selectedTab, criteria);
                api.setState("isFirstBackendCall", false);
                return parFilters;
            });
            break;

        case "NOW_SELECT#SELECTED_ITEM_SET":
            setOverLayMessage(api.state.selectedTab, "onload");
            const elementId = event.elementId;
            const value = event.payload.value;
            var propertyName = elementId == "state" ? "state" : "type";
            api.setState(propertyName, ({
                currentValue,
                api
            }) => {
                const criteria = {
                    filters: api.state.parFilters,
                    state: api.state.state,
                    type: api.state.type
                };
                criteria[propertyName] = value;
                clearAllTabResults();
                pullContent(api.state.selectedTab, criteria);
                return value;
            });

            break;

        case "UXF_TAB_SET#TAB_SELECTED":
            //check how to get page parameter and resolve the tab.
            var selectedTab = event.payload.selectedTab.replace("id=", "");
            var selectedTabConfiguration = api.state.tabsConfiguration[selectedTab];
            if (!selectedTabConfiguration) {
                console.error("missing configuration for the selected tab");
            }
            const {
                tableParameter
            } = selectedTabConfiguration;
            const table = api.state[tableParameter] || {};
            const noRows = !table.hasOwnProperty("rows");
            if (noRows) {
                setOverLayMessage(selectedTab, "onload");
            }
            loadHeaders(selectedTabConfiguration);
            api.setState("selectedTab", ({
                currentValue,
                api
            }) => {
                //check and skip table reload
                if (noRows && api.state.parFilters) {
                    const criteria = {
                        filters: api.state.parFilters,
                        state: api.state.state,
                        type: api.state.type
                    };
                    pullContent(selectedTab, criteria);
                }
                return selectedTab;
            });
            break;

    }
    function syncWithPageParameters() {
        //check filters update(categories and date)
        var criteriaChanged = false;
        var newParFilters = [];
        var pageProps = api.context.props;
        var existingParFilters = api.state.parFilters;
        var dateFilter = existingParFilters.find(function(filter){ return filter.type == "date";});
        var categoryFilter = existingParFilters.find(function(filter){ return filter.filterId == "1i87je9a8ir6bknr54tg";});
        var tableFilter = existingParFilters.find(function(filter){ return filter.filterId == "1i87jhnbh29639i34jbg";});
        
        if (dateFilter.start != pageProps.startdate || dateFilter.end != pageProps.enddate) {
            var newDateFilter = {...dateFilter};
            newDateFilter.start = pageProps.startdate;
            newDateFilter.end = pageProps.enddate;
            newDateFilter.dynamicTimeRange = pageProps.dynamictimerange;
            newParFilters.push(newDateFilter);
            setSelectedDateFilter(newDateFilter);
        }
        if (tableFilter) {
            var newTableFilter = {...tableFilter};
            newTableFilter.values = [];
            newParFilters.push(newTableFilter);
        }
        if ((categoryFilter && categoryFilter.values.length == 1 && categoryFilter.values[0] == pageProps.categories)||(!categoryFilter && !pageProps.categories)) {
            //do nothing
        } else {
            var existingCategory = api.state.InitialCategoryfilter;
            var newCategoryFilter = {...existingCategory};
            newCategoryFilter.values = pageProps.categories ? [pageProps.categories] : [];
            newParFilters.push(newCategoryFilter);
        }
        criteriaChanged = newParFilters.length > 0 || api.state.state != "all";
        
        api.setState("state", "all");
        //clear all tab results    
        if (criteriaChanged) {
            clearAllTabResults();
        }
        if (newParFilters.length > 0) {
            const {
                parFilters
            } = mergePARFiltersV2(existingParFilters, newParFilters);
            api.setState("parFilters", parFilters);
            newParFilters = parFilters;
        } else {
            newParFilters = existingParFilters;
        }
        //check tabname and pull content
        var selectedTab = pageProps.tabname ? pageProps.tabname : "most_trigerred_notification"
        var selectedTabConfiguration = api.state.tabsConfiguration[selectedTab];
        if (!selectedTabConfiguration) {
            console.error("missing configuration for the selected tab");
            return;
        }
        const {
            tableParameter
        } = selectedTabConfiguration;
        const table = api.state[tableParameter] || {};
        const noRows = clearAllTabResults || !table.hasOwnProperty("rows");
        if (noRows) {
            setOverLayMessage(selectedTab, "onload");
        }
        loadHeaders(selectedTabConfiguration);
        api.setState("selectedTab",({api}) => {
            if (noRows) {
                    const criteria = {
                        filters: newParFilters,
                        state:"all",
                        type: "all"
                    };
                    pullContent(selectedTab, criteria);
                }
                return selectedTab;
        });
    }
    function setSelectedDateFilter(dateFilter) {
        api.setState("selectedDateFilter", {
            start: dateFilter.start,
            end: dateFilter.end,
            dynamicTimeRange: dateFilter.dynamicTimeRange
        });
    }

    function loadHeaders(selectedTabConfiguration) {
        var {
            headerType,
            headerParameter
        } = selectedTabConfiguration;
        var existingHeaders = api.state[headerParameter] || {};
        //check and skip header reload
        if (!existingHeaders.hasOwnProperty("columns")) {
            //api.setState(headerParameter, dashboardUtils.getHeaders(headerType));
            dashboardUtils.getHeaders(headerType).then(result => {api.setState(headerParameter, result);});
        }
    }

    function clearAllTabResults() {
        var tabsConfiguration = api.state.tabsConfiguration;
        var tabsList = Object.getOwnPropertyNames(tabsConfiguration);

        for (var i = 0; i < tabsList.length; i++) {
            var tab = tabsList[i];
            var tabConfiguration = tabsConfiguration[tab];
            //reset all tables
            api.setState(tabConfiguration["tableParameter"], {});
            api.setState(tabConfiguration["totalRecords"], []);
            api.setState(tabConfiguration["pageNumber"], 0);
        }
    }

    function addDurationLabel(start, end) {
        var startDate = new Date(start);
        var endDate = new Date(end);
        var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
   if(endDate > yesterday)
    endDate = yesterday;
        var duration = startDate.getDate() + ' ' + startDate.toLocaleString('default', {
            month: 'short'
        }) + ' ' + startDate.getFullYear() + ' - ' + endDate.getDate() + ' ' + endDate.toLocaleString('default', {
            month: 'short'
        }) + ' ' + endDate.getFullYear();
        api.setState("durationLabel", duration);
    }

    function setOverLayMessage(tab, type) {
        if (tab && api.state.tabsConfiguration[tab]) {
            var overLayProperty = api.state.tabsConfiguration[tab]["overlayMessage"];
            if (overLayProperty) {
                dashboardUtils.getOverlayMessageForTable(type).then(overLayConfig => {
                api.setState(overLayProperty, overLayConfig);});
                
            }
        }
    }

    function resetOverlayMessage(tab) {
        if (tab && api.state.tabsConfiguration[tab]) {
            var overLayProperty = api.state.tabsConfiguration[tab]["overlayMessage"];
            if (overLayProperty) {
                api.setState(overLayProperty, {});
            }
        }
    }

    function pullContent(tab, criteria) {
        const {
            filters = []
        } = criteria;
        const {
            state = ""
        } = criteria;
        const {
            type = ""
        } = criteria;
        const body = {
            state,
            type,
            tab
        };
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            if (filter.type == "date") {
                body.startDate = filter.start;
                body.endDate = filter.end;
                body.dynamicTimeRange = filter.dynamicTimeRange;
                addDurationLabel(filter.start, filter.end);
            } else if (filter.filterId == "1i87jhnbh29639i34jbg") {
                body.tables = filter.values;
            } else if (filter.filterId == "1i87je9a8ir6bknr54tg") {
                body.categories = filter.values;
            }
        }

        helpers.snHttp('/api/snc/notification_dashboard/notifications/email/all', {
            method: 'POST',
            batch: false,
            body
        }).then(({
            response
        }) => {
            resetOverlayMessage(tab);
            var tableResult = response.result;
            var selectedTab = tab;
            var currentTabConfiguration = api.state.tabsConfiguration[tab];
            api.setState(currentTabConfiguration["totalRecords"], tableResult);
            var pageSize = api.state[currentTabConfiguration["pageSize"]];

            var pageResult = tableResult.slice(0, pageSize);

            var results = dashboardUtils.generateTable(selectedTab, pageResult, {
                key: "notificationSysId"
            });
            if (!results.rows || results.rows.length == 0) {
                setOverLayMessage(tab, "zero_results");
            }
            api.setState(currentTabConfiguration["tableParameter"], results);
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content" + error);
            setOverLayMessage(tab, "error");
        });


    }

}
