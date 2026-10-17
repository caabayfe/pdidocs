/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const {telemetryData} = api.context.props.payload;

    if (telemetryData && telemetryData.disable)
        return;

    let title = 'Checklist Item Undo';
    if (api.item && api.item.value && api.item.value.title )
        title = api.item.value.title;

    let payload = {
        title: title
    }

    if (telemetryData && telemetryData.append_to_payload)
        payload = {
            ...payload,
            ...telemetryData.append_to_payload
        }

    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Checklist card Undo Button Clicked',
        value: {
            payload
        }
    });
}
