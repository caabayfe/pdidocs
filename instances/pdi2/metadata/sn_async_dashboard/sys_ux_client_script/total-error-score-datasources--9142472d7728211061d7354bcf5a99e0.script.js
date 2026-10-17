/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var query = api.state.state_sysevent_query_errored_events;
    const syseventQuery = api.state.state_sysevent_query_with_params;
    if (syseventQuery != undefined && syseventQuery != null && syseventQuery != '') {
        query = query + '^' + syseventQuery;
    }

    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Total error events"
        },
        "tableOrViewName": "sysevent",
        "filterQuery": query,
        "id": "DS_TOTAL_ERROR_COUNT_ID"
    }];
    return data;
}
