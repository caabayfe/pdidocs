/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("Adding de-duplication template(s) to the running queue.").then((text) => {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "success_run",
                "action": {
                    "type": "dismiss"
                },
                "content": text,
                "status":"positive"
            }]
        });
    });
}
