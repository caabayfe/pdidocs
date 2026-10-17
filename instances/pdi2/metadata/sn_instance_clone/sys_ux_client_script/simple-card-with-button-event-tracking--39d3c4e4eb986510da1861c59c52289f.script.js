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

    const {telemetryData} = api.context.props.payload;

    if (telemetryData && telemetryData.disable)
        return;

    const {payload} = api.context.props;

    if (payload && payload.children.length > 0) {
        const label = payload.children[0].title || '';
        const title = payload.title || '';
        let eventPayload = {
            title: title,
            label: label
        };

        if (telemetryData && telemetryData.append_to_payload)
            eventPayload = {
                ...eventPayload,
                ...telemetryData.append_to_payload
            };

        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: 'Click Card Action',
            value: {
                eventPayload
            }
        });
    }
}
