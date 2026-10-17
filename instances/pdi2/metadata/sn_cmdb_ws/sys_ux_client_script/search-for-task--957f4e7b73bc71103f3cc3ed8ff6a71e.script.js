/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.isUserAssociatedTab) {
        api.setState("userSelectedTasksSearchTerm", event.payload.value);
    } else {
        api.setState("matchingTasksSearchTerm", event.payload.value);
    }
    api.data.deduplication_template_task_search.refresh();
}
