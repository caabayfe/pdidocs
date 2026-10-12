/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var filter = '';
    if (api.data.deduplication_template_show_only_open_tasks.output) {
        filter += '^task.state=1';
    }
    api.setState('showOnlyOpenTasksFilter', filter);
}
