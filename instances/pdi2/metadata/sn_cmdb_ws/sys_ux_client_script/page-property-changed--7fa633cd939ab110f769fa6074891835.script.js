/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.deduplication_template_get_all_libraries.refresh();
     api.data.get_list_of_published_dedup_templates.refresh();
}
