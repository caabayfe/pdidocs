/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let table = api.state.feedbackTaskData.table;
    let sysId = api.state.feedbackTaskData.sysId;
    
    return {
        "label": api.state.feedbackTaskData.displayName,
        "href": `now/knowledge-center/record/${table}/${sysId}`,
        "opensWindow": false
    };
}
