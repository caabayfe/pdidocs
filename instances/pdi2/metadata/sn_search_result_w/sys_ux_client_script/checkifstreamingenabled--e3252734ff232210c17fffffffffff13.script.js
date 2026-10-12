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
    var isStreamingEnabled = api.data.check_if_enabled_streaming.properties;
    // if property is not defined or set to true, set asyncParams to enable streaming
    api.setState('asyncParams', {
        "asyncMode": "GR_ONLY",
        "callbackType": "AMB",
        "enableStreaming": (isStreamingEnabled.value === null || isStreamingEnabled.booleanValue).toString()
    });
}
