/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.dt_for_virtual_agent_plugin_availability.output && !api.data.dt_for_virtual_agent_plugin_availability.output.isBUPluginActive) {
      return '';
    }
    return helpers.translateSync('No plugin installed.');
}
