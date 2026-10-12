/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var orderByExecutionCount = "^ORDERBYDESCcount";
    var query = api.state.scheduled_jobs_full_query;
    
    if (!query){
        var timestart = api.data.now_datetime_24_hours_ago.output.utcValue;
        var timeend = api.data.now_datetime_now.output.utcValue;
        return 'time_range_start>=' + timestart + '^time_range_end<=' + timeend + orderByExecutionCount;
    } else {
        return query + orderByExecutionCount;
    }
}
