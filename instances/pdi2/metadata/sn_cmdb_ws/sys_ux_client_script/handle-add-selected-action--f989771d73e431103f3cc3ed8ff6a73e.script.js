/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (api.state.selectedTemplate == 'none') {
        helpers.translate("Please select a template.").then((text) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    "id": "failed_to_add_tasks",
                    "status": "critical",
                    "icon": "info-circle-outline",
                    "content": text,
                    "action": { "type": "dismiss" }
                }]
            });
        });
    } else {
        api.data.deduplication_template_add_tasks.execute({
            "templateSysId" : api.state.selectedTemplate,
            "query" : event.payload.query,
            "selectionQuery" : event.payload.selectionQuery
        });

        api.data.deduplication_template_get_manually_associated_tasks.refresh();
        api.data.deduplication_template_get_all_tasks_count.refresh();
        api.setState("listRefreshRequested", {"timestamp" : Date.now()});
    }
}
