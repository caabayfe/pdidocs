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
    const {
        telemetryData
    } = api.context.props.payload;

    const {
        interaction,
        interaction_payload
    } = api.context.props.payload.props_details;
    
    if (telemetryData && telemetryData.disable)
        return;

    const label = api.context.props.payload.title ? api.context.props.payload.title : 'Interactive Custom Content Card';
    const eventName = interaction === 'click' ? label + ' clicked' : label + ' selected';

    var payload = {
        cardName: label,
        parentComponent: api.context.props.payload.parent_block_id,
        eventPayload: interaction_payload,
        actionType: interaction
    };

    if (telemetryData && telemetryData.append_to_payload)
        payload = {
            ...payload,
            ...telemetryData.append_to_payload
        };

    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: eventName,
        value: {
            payload
        }
    });
}
