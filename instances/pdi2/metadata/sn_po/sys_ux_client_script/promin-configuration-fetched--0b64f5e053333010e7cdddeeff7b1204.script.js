/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const prominConfig = api.data.fetch_promin_configuration_1.output.data.GlidePromin_Query.configuration;
    api.setState('permissions', prominConfig.cimIntegration.permissions);
    api.setState('plugin_active', prominConfig.cimIntegration.isPluginActive);
}
