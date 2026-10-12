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
    const payload = api.context.props.payload;
    const { allow_child_event_propagation } = api.context.props.payload.props_details;
    if (payload && (payload.isRoot || allow_child_event_propagation === 'true')) {
        api.emit('ACE_ACTION_PERFORMED_RELAY_6368cda1eb210110d05213b34752288e', {
            eventName: event.payload.eventName,
            eventPayload: event.payload.eventPayload
        });
    }
}
