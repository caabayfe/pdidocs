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
    const processPermissions = api.data.get_process_config_permissions.output.data.snPo.GlideProminProcessConfigurations.prominProcessPermissions;
    api.setState('processPermissions', processPermissions);
}
