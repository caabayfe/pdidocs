/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var dateQuery = api.state.state_stats_date_query;
    if (dateQuery == undefined || dateQuery == null) {
        dateQuery = 'sys_created_onBETWEENjavascript:gs.hoursAgoStart(24)@javascript:gs.hoursAgo(0)';
    }
    var query = 'interval_endISNOTEMPTY' + '^' + dateQuery;
    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Event Delegator Stats"
        },
        "tableOrViewName": "sysevent_delegator_stats",
        "filterQuery": query,
        "id": "DS_DELEGATOR_STATS_ID"
    }];
    return data;
}
