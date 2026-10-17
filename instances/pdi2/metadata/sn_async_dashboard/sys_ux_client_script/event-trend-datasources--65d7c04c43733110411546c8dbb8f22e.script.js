/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var query = '';
    const statsQuery = api.state.state_stats_query_with_params;
    if (statsQuery != undefined && statsQuery != null) {
        query = statsQuery;
    }

    var dateQuery = api.state.state_stats_date_query;
    if (dateQuery == undefined || dateQuery == null) {
        dateQuery = 'sys_created_onBETWEENjavascript:gs.hoursAgoStart(24)@javascript:gs.hoursAgo(0)';
        query = query + '^' + dateQuery;
    }

    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Event stats"
        },
        "tableOrViewName": "sysevent_event_stats",
        "filterQuery": query,
        "id": "DS_EVENT_STATS_ID"
    }];
    return data;
}
