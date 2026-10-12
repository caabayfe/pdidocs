/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: event.payload.eventName,
        eventPayload: {
            listController: api.data.list_controller,
            listControllerRefreshRequested: api.data.list_controller.refreshRequested,
            setState: api.setState
        }
    });
}
