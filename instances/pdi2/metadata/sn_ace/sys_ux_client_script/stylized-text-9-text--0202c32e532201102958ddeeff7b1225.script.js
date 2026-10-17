/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
  const newerVersion = api.state.plugin.newerVersion || 'NA';
    return `Updating to: ${newerVersion}`;
}
