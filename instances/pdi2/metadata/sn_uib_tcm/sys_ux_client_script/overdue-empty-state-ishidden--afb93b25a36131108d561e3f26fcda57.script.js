/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let overDueTasks = api.state.overDueTasks;
    if (overDueTasks.length == 0)
        return false;
    else return true;   
}
