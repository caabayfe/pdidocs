/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 
    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            "id": "error_run",
            "status": "critical",
            "icon": "info-circle-outline",
            "content": event.payload.data.output.display_error,
            "action": { "type": "dismiss" }
        }]
    });
    
}
