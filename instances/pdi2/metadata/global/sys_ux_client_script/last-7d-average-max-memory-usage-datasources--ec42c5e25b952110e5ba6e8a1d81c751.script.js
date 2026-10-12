/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    const topMidmaxMemoryPercentUsage = api.data.mid_server_top5_avg_max_memory_usage.output.result[0].response.data.slice(1);
    let top5MidMaxMemoryUsage = [];
    topMidmaxMemoryPercentUsage.map(data => top5MidMaxMemoryUsage.push(data[0]));

    return [{
        "isDatabaseView": false,
        "allowRealTime": true,
        "sourceType": "table",
        "label": {
            "message": "MID host: average max memory usage"
        },
        "tableOrViewName": "ecc_agent_memory_metric",
        "filterQuery": "name=memory.use^sys_created_on>=javascript:gs.beginningOfLast7Days()^agentIN" + top5MidMaxMemoryUsage,
        "id": "dsIdtop5maxMemoryPercentUsage"
    }];
}
