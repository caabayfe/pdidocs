/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("Template retired successfully").then((text) => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "successful_run",
                "status": "positive",
                "icon": "info-circle-outline",
                "content": text,
                "action": { "type": "dismiss" }
            }]
        });
    });
    api.data.deduplication_template_get_library_tree.refresh();
    api.data.deduplication_template_get_all_libraries.refresh(); 
    api.setState('viewMode', 'library');
}
