/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(!api.state.tier2StorageStats.stats.storageUnit) return;
  return helpers.translateSync("Object storage used") + " (" + helpers.translateSync(api.state.tier2StorageStats.stats.storageUnit) + ")";
}
