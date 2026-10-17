/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("The de-duplication task is now running").then((text) => {
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
}
