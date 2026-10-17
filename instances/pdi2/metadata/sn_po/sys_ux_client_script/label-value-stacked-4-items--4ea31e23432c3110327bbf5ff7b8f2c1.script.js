/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const statuses = {
        AVAILABLE: 'positive',
        CANCELLED: 'low',
        ERROR: 'critical',
        MINING_DATA: 'high',
        SCHEDULED: 'low',
        NEW: 'positive',
    };
    const projectState = api.state?.projectData?.miningState?.label;
    return [{
        "label": helpers.translateSync("Mining state"),
        "value": [{
            "label": projectState,
            "type": "highlighted-value",
            'color': statuses[api.state?.projectData?.miningState?.value],
            'showIcon': false
        }]
    }];
}
