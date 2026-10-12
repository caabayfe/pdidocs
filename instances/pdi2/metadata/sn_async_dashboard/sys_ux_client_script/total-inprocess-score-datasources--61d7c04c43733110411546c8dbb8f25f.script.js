/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
   //stateSTARTSWITHqueue^ORstateSTARTSWITHready.^ORstateSTARTSWITHresume
    var query = api.state.state_sysevent_query_inprocess_events;
    const syseventQuery = api.state.state_sysevent_query_with_params;
    if (syseventQuery != undefined && syseventQuery != null && syseventQuery != '') {
        query = query + '^' + syseventQuery;
    }

    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Total in process events"
        },
        "tableOrViewName": "sysevent",
        "filterQuery": query,
        "id": "DS_TOTAL_IN_PROCESS_COUNT_ID"
    }];
    return data;
}
