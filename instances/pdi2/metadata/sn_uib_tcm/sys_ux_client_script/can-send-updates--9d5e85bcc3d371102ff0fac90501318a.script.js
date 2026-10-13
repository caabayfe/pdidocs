/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var accessDenied = !api.data.can_send_updates.output;
    api.setState("accessDenied",accessDenied);
    var content = await helpers.translate("Access denied");
    if(accessDenied){
        var items = [{
            "action": {
            "type": "dismiss"
            },
            "content": content,
            "icon": "circle-close-outline",
            "id": "comm-task-access-denied",
            "status": "critical"
        }];
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: items
        });
    }
}
