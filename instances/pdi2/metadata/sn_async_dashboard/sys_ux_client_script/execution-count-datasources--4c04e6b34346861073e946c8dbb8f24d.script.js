/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var query = api.state.scheduled_jobs_full_query;
    if (!query) {
        var timestart = api.data.now_datetime_24_hours_ago.output.utcValue;
        var timeend = api.data.now_datetime_now.output.utcValue;
        query = 'time_range_start>=' + timestart + '^time_range_end<=' + timeend;
    }
    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Execution Count"
        },
        "tableOrViewName": "sys_scheduler_job_history",
        "filterQuery": query,
        "id": "EXECUTION_ID"
    }];
    return data;
}
