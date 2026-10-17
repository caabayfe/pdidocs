/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var currentVersion = api.state.currentVersion;
  return helpers.translateSync('{0} is the latest available version. Your instance is up to date.', currentVersion);
}
