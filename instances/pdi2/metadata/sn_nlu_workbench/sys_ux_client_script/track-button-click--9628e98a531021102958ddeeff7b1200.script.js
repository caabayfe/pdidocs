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
    
    if (telemetryData && telemetryData.disable)
        return;

    const {
        button_text,
        button_action_type,
        button_action_payload
    } = api.context.props.payload.props_details;    

    const buttonLabel = button_text ? button_text : 'Interactive Custom Content Card Button';
    const eventName = buttonLabel + ' clicked';
    const actionType = button_action_type;

    var payload = {
        buttonName: buttonLabel,
        parentComponent: 'Interactive Custom Content Card',
        eventPayload: button_action_payload,
        buttonActionType: button_action_type
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
