/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const error = api.state.error !== '' && api.state.error != null;
    const pluginInstalled = api.state.isDMAnalyticsPluginInstalled;
    //return true to hide the error state 
    //if the plugin is installed and there are no errors
    return pluginInstalled && !error;
}
