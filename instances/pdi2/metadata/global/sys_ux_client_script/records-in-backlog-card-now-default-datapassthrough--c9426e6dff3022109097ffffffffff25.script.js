/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if(api.data.transform_records_in_backlog_for_a_rule.output == undefined) return [];
    return [{
        "data": [{
            "value": api.data.transform_records_in_backlog_for_a_rule.output.count.value
        }],
        "metadata": {
            "scoreDate": api.data.transform_records_in_backlog_for_a_rule.output.count.timestamp.toString()
        }
    }];
}
