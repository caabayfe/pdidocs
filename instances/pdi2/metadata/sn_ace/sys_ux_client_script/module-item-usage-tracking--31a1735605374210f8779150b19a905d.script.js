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
    const item = api.context.props.item;
    const telemetryData = item?.props_details?.telemetryData
    if (!telemetryData) {
         return;
    }
    if (telemetryData && telemetryData.disable)
        return;
        
    let payload = {
        title: item.title || ''
    };

    if (telemetryData && telemetryData.append_to_payload) {
        payload = {
            ...payload,
            ...telemetryData.append_to_payload
        };
    }
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: telemetryData.event_name || "Module Item Clicked",
        value: {
            payload
        }
    });

}
