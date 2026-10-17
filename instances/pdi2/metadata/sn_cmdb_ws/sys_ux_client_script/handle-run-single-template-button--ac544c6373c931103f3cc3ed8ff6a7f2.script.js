/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var templateSysIds = [api.item.value.template_sys_id];

    api.data.deduplication_template_run.execute({
        "templateSysIds": templateSysIds
    });

    api.data.get_list_of_published_dedup_templates.refresh();
}
