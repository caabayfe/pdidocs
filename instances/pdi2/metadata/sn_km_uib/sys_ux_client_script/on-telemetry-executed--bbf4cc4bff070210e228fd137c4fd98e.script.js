/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.name === 'DATA_FETCH_SUCCEEDED') {
        if (api.state.isTelemetryExecuting && !api.data.recordpage3columnlayouttelemetry_1.output) {
            console.error('Failed to transmit telemetry');
        }
    } else {
        console.error('Failed to transmit telemetry');
    }
    api.setState('isTelemetryExecuting', false);
}
