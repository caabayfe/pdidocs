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
    const selectedQueue = event.payload.value;
    if(selectedQueue !== api.state.state_queue_name)
        api.setState('state_event_name', undefined);
    api.setState('state_queue_name', selectedQueue);
}
