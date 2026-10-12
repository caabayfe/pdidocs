/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var processorActiveQuery = "state=active";
    const query = api.state.state_processor_queue_query_with_params;
    if (query != undefined && query != null && query != '') {
        processorActiveQuery = processorActiveQuery + '^' + query;
    }
    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Total active processors"
        },
        "tableOrViewName": "sys_event_processor",
        "filterQuery": processorActiveQuery,
        "id": "DS_TOTAL_ACTIVE_PROCESSOR_COUNT_ID"
    }];
    return data;
}
