/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    const commTaskIndex = event.context.item.index;
    const overDueCollapse = api.state.overDueCollapse;
    let commTask = event.context.item.value;
    commTask.commTaskType = playBookCommunicationCardUtil.CONSTANTS.OVERDUE;
    let upcomingTasks = api.state.upcomingTasks;
    let overDueTasks = api.state.overDueTasks;
    commTask.collapseAll = (overDueCollapse) ? overDueCollapse : commTask.collapseAll;
    if (commTaskIndex > -1) upcomingTasks.splice(commTaskIndex, 1);
    api.setState("upcomingTasks", [...upcomingTasks]);
    overDueTasks.push(commTask);
    api.setState("overDueTasks", [...overDueTasks]);
}
