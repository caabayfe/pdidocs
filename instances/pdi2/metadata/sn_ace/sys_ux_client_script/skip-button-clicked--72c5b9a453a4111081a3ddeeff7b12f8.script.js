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
    
    let title = 'CheckList Item Skipped';
    if (api.state.itemPayload && api.state.itemPayload.value &&
        api.state.itemPayload.value.title)
        title = api.state.itemPayload.value.title;
    
    let payload = {
        title: title
    }

    if (telemetryData && telemetryData.append_to_payload)
        payload = {
            ...payload,
            ...telemetryData.append_to_payload
        }
    
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'CheckList Item Skipped',
        value: {
            payload
        }
    });

}
