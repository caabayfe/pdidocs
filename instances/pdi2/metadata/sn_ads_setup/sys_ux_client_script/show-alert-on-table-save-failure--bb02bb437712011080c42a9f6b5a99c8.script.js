/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.items[0].type !== 'error')
        return;
    
    const message = `<div>${event.payload.items[0].message}</div>`;

       api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                    id: 'alert-1',
                    status: 'critical',
                    icon: 'exclamation-triangle-fill',
                    content: {
                        "type": "html",
                        "value": message
                    },
                    action: {
                        type: 'dismiss'
                    }
                }]
        });
    
}
