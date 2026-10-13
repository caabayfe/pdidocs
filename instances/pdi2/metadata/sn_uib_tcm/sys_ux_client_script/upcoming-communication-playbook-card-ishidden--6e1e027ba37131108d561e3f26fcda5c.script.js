/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const taskType = "communication";
    if (api.item.value.taskType != taskType)
        return true;
    return false;
}
