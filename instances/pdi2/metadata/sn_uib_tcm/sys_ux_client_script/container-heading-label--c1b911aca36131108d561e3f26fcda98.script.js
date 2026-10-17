/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const tasks = (api.state) ? api.state.overDueTasks : [];
    const heading = (api.state) ? api.state.pageHeading : "";
    if (tasks.length > 0 && heading)
        return helpers.translateSync("{0} ({1} due)", [heading, tasks.length]);
    return heading;
}
