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
    var eventOrigin = event.payload.eventOrigin;
    var currentTabParFilters = event.payload.currentTabParFilters;
    var payload;

    function emitNavigation(route, params, fields, title) {
        api.emit('NAV_ITEM_SELECTED', {
            route: route || '',
            params: params || {},
            fields: fields || {},
            title: title || ''
        });
    }

    function setVizSelection(table, query, title) {
        api.setState('currentVizSelection', {
            ...api.state.currentVizSelection,
            table: table,
            query: query + "^ORDERBYDESCsys_updated_on",
            title: title,
            listView: 'sow_landing_page'
        });
        api.setState('widgetClicked', true);
    }

    function toggleListVisibility(hide = true) {
        api.setState('hideList', hide);
    }

    function generatePayloadForIndicator(params, currentTabParFilters) {
        var payload = {
            route: 'kpi-details',
            fields: {
                dataSourceId: params.kpiSysId || params.indicatorSysid,
                dataSource: params.kpiSysId ? 'analyticalmodel' : 'kpid'
            },
            params: {
                breakdowns: params.breakdowns,
                aggregate: params.aggregate,
                scoreDate: params.scoreDate,
                domain: params.domain
            },
            title: 'KPI Details'
        };

        if (params.dataSourceType === "indicator" && currentTabParFilters) {
            var parFilters = currentTabParFilters.parFilters || [];
            payload.params.startDate = parFilters.length ? parFilters[0].start : null;
            payload.params.endDate = parFilters.length ? parFilters[0].end : null;
        }

        return payload;
    }

    switch (eventOrigin) {
        case "NOW_VIS_WRAPPER#CLICKED":
            {
                var params = event.payload.params;
                var title = event.payload.title;
                var dataSourceType = params.dataSourceType;
                toggleListVisibility(true);

                switch (true) {
                    case dataSourceType === "table":
                        toggleListVisibility(false);
                        var elements = (event && event.payload && event.payload.data && event.payload.data.elements) || [];
                        var selectedSection = (Array.isArray(elements) && elements.length === 1) ? elements[0] : '';
                        var title = (params.listTitle || '') + (selectedSection ? ' - ' + selectedSection : '');
                        setVizSelection(params.table, params.query, title);  
                        break;
                    
                    case dataSourceType === "indicator":
                    case !!params.kpiSysId:
                        payload = generatePayloadForIndicator(params, currentTabParFilters);
                        break;
                    
                    case dataSourceType === "metricBase":
                        payload = {
                            route: 'metric-explorer',
                            params: {
                                ciSysId: params.ciSysId,
                                ciType: params.ciType,
                                startTime: params.dateRange.startTime,
                                endTime: params.dateRange.endTime,
                                chartIndex: -1
                            },
                            title: 'Metric Explorer'
                        };
                        break;
                    
                    case dataSourceType === "hlaElasticSearchComponents":
                        toggleListVisibility(true);
                        payload = {
                            route: 'log-viewer',
                            title: 'Log viewer'
                        };
                        break;
                }
                if (payload) {
                    emitNavigation(payload.route, payload.params, payload.fields, payload.title);
                }
                break;
            }

        case "NOW_RECORD_LIST_CONNECTED#ROW_CLICKED":
        case "SN_PAR_CALENDAR_CONNECTED#EVENT_CLICKED":
            toggleListVisibility(true);
            var table = eventOrigin === "NOW_RECORD_LIST_CONNECTED#ROW_CLICKED" ? event.payload.table : event.payload.event.table;
            var sysId = eventOrigin === "NOW_RECORD_LIST_CONNECTED#ROW_CLICKED" ? event.payload.row.sys_id.value : event.payload.event.sysId;
            emitNavigation("record", {}, {
                table: table,
                sysId: sysId
            });
            break;

        case "NOW_RECORD_LIST_CONNECTED#VIEW_ALL_CLICKED":
            toggleListVisibility(false);
            var table = event.payload.table;
            var query = event.payload.query;
            var listTitle = event.payload.listTitle;
            var listFilters = event.payload.listFilters;
            var filterQueries = (currentTabParFilters && currentTabParFilters.encodedQueries && currentTabParFilters.encodedQueries[table]) ?
                currentTabParFilters.encodedQueries[table] + '^' : '';
            var queryWithFilters = listFilters ? (filterQueries + (query || '') + '^' + listFilters) : (filterQueries + (query || ''));
            setVizSelection(table, queryWithFilters, listTitle);
            break;

        default:
            console.warn("Unhandled event type: " + eventOrigin);
            toggleListVisibility(true);
    }
    
    api.setState('listRefreshRequested', {
        timestamp: new Date().getTime()
    });
}
