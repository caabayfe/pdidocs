/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var query = 'status=active';
    var rowCount = api.data.queue_registry_lookup.output.data.GlideRecord_Query.sysevent_queue._rowCount;
    if (rowCount != 0) {
        var data = api.data.queue_registry_lookup.output.data.GlideRecord_Query.sysevent_queue._results;
        var identifier = data[0]._row_data.uniqueValue;
        if (identifier != undefined || identifier != null) {
            query += '^queue_ref=' + identifier;
        }
    }
    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Total framework jobs"
        },
        "tableOrViewName": "sysevent_queue_config",
        "filterQuery": query,
        "id": "DS_TOTAL_ACTIVE_PROCESSING_FRAMEWORK_JOB_COUNT_ID"
    }];
    return data;
}
