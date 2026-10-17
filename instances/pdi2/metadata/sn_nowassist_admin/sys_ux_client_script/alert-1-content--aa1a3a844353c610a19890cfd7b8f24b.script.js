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
      return helpers.translateSync('Install at least one product plugin so that you can turn on Dynamic Translation.');
    }
    return helpers.translateSync('Install the Dynamic Translation plugin.');
}
