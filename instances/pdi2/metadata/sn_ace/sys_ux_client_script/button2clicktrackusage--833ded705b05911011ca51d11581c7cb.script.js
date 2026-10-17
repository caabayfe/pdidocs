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
        button2Info, additionalData
    } = api.context.props.payload.listItemPayload;
    if (!button2Info)
        return;

    const buttonLabel = button2Info.label ? button2Info.label : 'button2';
    const eventName = buttonLabel + ' clicked';

    var payload = {
        buttonName: buttonLabel,
        parentComponent: 'Dynamic Cards List',
        buttonActionEvent: api.context.props.payload.button2eventName ? api.context.props.payload.button2eventName : ''
    };

    if (telemetryData && telemetryData.hasPayload && telemetryData.append_to_payload)
        payload = {
            ...payload,
            ...telemetryData.append_to_payload,
            ...additionalData
        };

    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: eventName,
        value: {
            payload
        }
    });
}
