/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: "SOW_ADMIN_CENTER_LIST#ROW_REORDERED",
        eventPayload: {
            data: event.payload.data,
            listControllerRefreshRequested: api.data.list_controller.refreshRequested,
            setState: api.setState
        }
    });
}
