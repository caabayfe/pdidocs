/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var isEmptyState = false;
    if (api.data.deduplication_template_get_manually_associated_tasks.output.items.length == 0) {
        isEmptyState = true;
    }
    if (!api.state.isTemplateReadOnly && !api.state.isTemplateSelectionValid) {
        isEmptyState = true;
    }

    api.setState("isUserSelectedTasksEmpty", isEmptyState);
}
