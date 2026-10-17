/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const topMidAvgCpuUsage = api.data.mid_server_top5_avg_cpu_usage.output.result[0].response.data.slice(1);
    let top5MidAvgCpuUsage = [];
    topMidAvgCpuUsage.map(data => top5MidAvgCpuUsage.push(data[0]));

    return [{
        "isDatabaseView": false,
        "allowRealTime": true,
        "sourceType": "table",
        "label": {
            "message": "MID host: average CPU usage"
        },
        "tableOrViewName": "ecc_agent_scalar_metric",
        "filterQuery": "name=cpu.use^sys_created_on>=javascript:gs.beginningOfLast7Days()^agentIN" + top5MidAvgCpuUsage,
        "id": "dsIdtop5AvgCpuUsage"
    }];
}
