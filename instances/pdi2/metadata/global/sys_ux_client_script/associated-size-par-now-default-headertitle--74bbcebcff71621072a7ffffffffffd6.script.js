/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var storageUnit = api.state.tableStats?.storageUnit || 'GB';
  return helpers.translateSync("Associated table size") + " (" + helpers.translateSync(storageUnit) + ")";
}
