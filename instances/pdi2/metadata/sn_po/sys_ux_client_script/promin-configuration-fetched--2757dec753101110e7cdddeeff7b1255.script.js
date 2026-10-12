/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const prominConfig = api.data.fetch_promin_configuration_1.output.data.GlidePromin_Query.configuration;
    api.setState('prominConfig', prominConfig);
}
