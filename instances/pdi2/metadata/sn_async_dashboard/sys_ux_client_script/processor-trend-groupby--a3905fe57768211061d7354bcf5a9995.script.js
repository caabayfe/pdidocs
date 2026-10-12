/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var groupby = [{
        "maxNumberOfGroups": "ALL",
        "numberOfGroupsBasedOn": "",
        "showOthers": false,
        "groupBy": [{
            "dataSource": "DS_PROCESSOR_STATS_ID",
            "groupByField": "",
            "isRange": false,
            "isPaBucket": false
        }]
    }];
    return groupby;
}
