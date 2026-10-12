/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var templateName = api.data.look_up_template.result.name.displayValue;

    helpers.translate("Cannot run {0} template. The template is either already running or not yet published.", templateName).then((text) => {
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
