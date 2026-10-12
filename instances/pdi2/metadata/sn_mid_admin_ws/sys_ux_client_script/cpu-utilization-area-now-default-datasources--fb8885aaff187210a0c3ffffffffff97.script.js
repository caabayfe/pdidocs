/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const mid = api.context.props.sysId;
    return [{
        "isDatabaseView": false,
        "allowRealTime": true,
        "sourceType": "table",
        "label": {
            "message": "MID host: average CPU usage"
        },
        "tableOrViewName": "ecc_agent_scalar_metric",
        "filterQuery": "name=cpu.use^agent=" + mid,
        "id": "dsMidAvgCpuUsage"
    }];
}
