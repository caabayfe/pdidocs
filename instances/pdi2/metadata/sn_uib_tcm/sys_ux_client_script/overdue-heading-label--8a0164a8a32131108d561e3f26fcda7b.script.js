/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return helpers.translateSync("Overdue ({0})", [api.state.overDueTasks.length]);
}
