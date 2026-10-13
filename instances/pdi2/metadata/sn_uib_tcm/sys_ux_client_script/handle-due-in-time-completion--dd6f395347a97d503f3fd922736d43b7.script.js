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
    const commManagementUtil = imports['sn_uib_tcm.CommunicationManagementUXFClientBaseUtil']();
    var index = event.context.item.index;
    var commTask = event.context.item.value;
    var commTasksByState = api.state.commTasksByState;
    if (commTask.statusGroup == "Upcoming") {
        commTask.statusGroup = "Overdue";
        for (var i = 0; i < commTasksByState.length; i++) {
            var comm_tasks = commTasksByState[i].comm_tasks || [];
            if (commTasksByState[i].name == "Upcoming" && comm_tasks && index < comm_tasks.length && comm_tasks[index].sys_id.value == commTask.sys_id.value) comm_tasks.splice(index, 1);
            else if (commTasksByState[i].name == "Overdue" && comm_tasks.findIndex(commTaskObj => commTaskObj.sys_id.value === commTask.sys_id.value) == -1) comm_tasks.push(commTask);
            commTasksByState[i].comm_tasks = comm_tasks;
        }
        const currentFilters = api.state.filterBy;
        if (currentFilters && currentFilters.length) api.setState("commTasksByState", [...commManagementUtil.filterCommTasks(commTasksByState, currentFilters, api.context.props.tabType)]);
        else api.setState("commTasksByState", [...commTasksByState]);
    }
}
