/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    const topMidLifecycleEvents = api.data.mid_server_top5_lifecycle_event.output.result[0].response.data.slice(1);
    let top5MidsLifecycleEvent = [];
    topMidLifecycleEvents.map(data => top5MidsLifecycleEvent.push(data[0]));

    return [{
        "isDatabaseView": false,
        "allowRealTime": true,
        "sourceType": "table",
        "label": {
            "message": "MID server life-cycle event history"
        },
        "tableOrViewName": "mid_server_event",
        "filterQuery": "sys_created_onONLast 7 days@javascript:gs.beginningOfLast7Days()@javascript:gs.endOfLast7Days()^agentIN" + top5MidsLifecycleEvent,
        "id": "dsIdtop5LifecycleEvent"
    }];
}
