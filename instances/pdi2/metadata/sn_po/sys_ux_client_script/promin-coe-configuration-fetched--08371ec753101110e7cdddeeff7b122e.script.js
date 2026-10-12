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
    const automationCenterConfig = api.data.fetch_coe_configuration_1.output.data.now.GlidePromin.automationCenterConfig;
    api.setState('automationCenterConfig', automationCenterConfig);
}
