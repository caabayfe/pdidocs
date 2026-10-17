/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var archiveRuleBacklogRecords = [];
    var deleteRuleBacklogRecords = [];

    var recordsInBacklogTrend = api.state.recordsInBacklogTrend;
    var archiveRuleTrend = recordsInBacklogTrend.filter(trend => trend.ruleType == "ARCHIVE");
    var deleteRuleTrend = recordsInBacklogTrend.filter(trend => trend.ruleType == "TABLE_CLEANER");
    var archiveRuleBacklogRecords = (archiveRuleTrend && archiveRuleTrend[0]) ? archiveRuleTrend[0].backlogRecords : [];
    var deleteRuleBacklogRecords = (deleteRuleTrend && deleteRuleTrend[0]) ? deleteRuleTrend[0].backlogRecords : [];
    
    var trend = [{
        data: archiveRuleBacklogRecords,
        metadata: {
            timeZone: "SESSION",
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
                label: helpers.translateSync("Archive"),
                type: "value"
            }]
        }
    }, {
        data: deleteRuleBacklogRecords,
        metadata: {
            timeZone: "SESSION",
            aggregate: {
                fieldType: "decimal"
            },
            format: {
                frequency: "monthly",
                precision: 2,
                unitFormat: "{0}"
            },
            series: [{
                id: "value",
                label: helpers.translateSync("Delete"),
                type: "value"
            }]
        }
    }];

    return trend;

}
