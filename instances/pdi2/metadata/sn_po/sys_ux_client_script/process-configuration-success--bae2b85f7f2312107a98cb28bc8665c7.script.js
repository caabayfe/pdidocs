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
    const processConfig = event.payload.data.output.data.GlidePromin_Query.configuration.process;
    if(processConfig) {
        api.setState('processConfig', processConfig);
        api.setState('touchPoints', processConfig.touchPoints || {});
    }
}
