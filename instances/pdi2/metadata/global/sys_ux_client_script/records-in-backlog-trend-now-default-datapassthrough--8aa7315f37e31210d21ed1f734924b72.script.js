/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var trendData = api.state.recordsInBacklogTrend;
    var recordsInBacklogTrend = [{
        data: trendData,
        metadata: {
            aggregate: {
                fieldType: "decimal"
            },
            format: {
                frequency: "monthly",
                precision: 0,
                unitFormat: "{0}"
            },
            series: [{
                id: "value",
                label: helpers.translateSync("Records in backlog"),
                type: "value"
            }]
        }
    }];
    return recordsInBacklogTrend;
}
