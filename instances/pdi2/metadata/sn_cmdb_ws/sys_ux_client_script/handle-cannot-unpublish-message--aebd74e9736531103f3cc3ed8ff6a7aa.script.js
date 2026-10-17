/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.data.deduplication_template_can_unpublish.output) {
        helpers.translate("The template is currently running and cannot be unpublished").then((text) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    "id": "cannot_unpublish",
                    "status": "info",
                    "icon": "info-circle-outline",
                    "content": text,
                    "action": { "type": "dismiss" }
                }]
            });
        });
    }
}
