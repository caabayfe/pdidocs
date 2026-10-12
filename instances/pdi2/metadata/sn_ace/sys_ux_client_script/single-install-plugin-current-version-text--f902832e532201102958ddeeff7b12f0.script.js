/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
  const currentVersion = api.state.plugin.currentVersion || 'NA';
    return `Current version: ${currentVersion}`;
}
