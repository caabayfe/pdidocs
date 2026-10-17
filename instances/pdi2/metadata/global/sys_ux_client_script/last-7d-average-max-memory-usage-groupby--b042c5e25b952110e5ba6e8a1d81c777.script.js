/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
        "maxNumberOfGroups": "ALL",
        "numberOfGroupsBasedOn": "NO_OF_GROUP_BASED_ON_PER_METRIC",
        "showOthers": false,
        "groupBy": [{
            "dataSource": "dsIdtop5maxMemoryPercentUsage",
            "groupByField": "agent",
            "isRange": false,
            "isPaBucket": false
        }]
    }];
}
