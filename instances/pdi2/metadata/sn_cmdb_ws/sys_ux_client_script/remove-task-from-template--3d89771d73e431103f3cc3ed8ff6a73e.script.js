/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var taskIdToRemove = event.context.item.value.sysId;
    api.data.deduplication_template_remove_tasks.execute({
            "taskIds": taskIdToRemove,
        });

    // update the current task list by removing the one user has selected
    // user can only remove one task at a time, so taskId will always be one single ID

    var currentTaskIds = api.state.userSelectedFilteredTasks;
    var updatedTaskIds = currentTaskIds.filter(e => e !== taskIdToRemove);
    api.setState("userSelectedFilteredTasks", updatedTaskIds);

    api.data.deduplication_template_get_manually_associated_tasks.refresh();
    api.data.deduplication_template_filter_tasks.refresh();
    api.data.deduplication_template_get_all_tasks_count.refresh();

    api.setState("listRefreshRequested", {"timestamp" : Date.now()});
}
