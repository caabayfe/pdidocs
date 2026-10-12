/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    if(!event.payload.data.output.error) {
        api.data.get_list_of_published_dedup_templates.refresh();
        api.setState('schedule',{});
    } else {
        var message = event.payload.data.output.message ? event.payload.data.output.message : "Error saving schedule";
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "error_savingschedule",
                "status": "critical",
                "icon": "info-circle-outline",
                "content": message,
                "action": {
                    "type": "dismiss"
                }
            }]
        });
    }
}
