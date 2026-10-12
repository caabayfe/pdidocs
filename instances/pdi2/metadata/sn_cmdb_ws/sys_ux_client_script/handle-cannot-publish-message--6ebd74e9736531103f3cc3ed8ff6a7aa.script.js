/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.data.deduplication_template_can_publish.output) {
        helpers.translate("All steps in the template creation workflow must be completed before this template can be published.").then((text) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    "id": "cannot_publish",
                    "status": "info",
                    "icon": "info-circle-outline",
                    "content": text,
                    "action": { "type": "dismiss" }
                }]
            });
        });
    }
}
