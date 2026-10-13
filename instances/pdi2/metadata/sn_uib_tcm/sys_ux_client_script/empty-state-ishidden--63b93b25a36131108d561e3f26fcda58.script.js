/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const upcomingTasks = api.state.upcomingTasks;
    const overDueTasks = api.state.overDueTasks;
    const pageLoaded = api.state.pageLoaded;
    const dataFetchFailed = api.state.dataFetchFailed;
    const activeTasks = api.state.activeTasks;
    return !((upcomingTasks.length == 0 && overDueTasks.length == 0 && activeTasks.length == 0 && pageLoaded) || dataFetchFailed);
}
