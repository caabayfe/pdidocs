/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('runningTemplatesLoading', false);
    var errors = api.data.get_running_dedupe_templates.output.errors;
    helpers.translate("Failed to get published templates with the following error: {0}", errors.join('. ')).then((text) => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "error_run",
                "status": "critical",
                "icon": "info-circle-outline",
                "content": text,
                "action": { "type": "dismiss" }
            }]
        });
    });
}
