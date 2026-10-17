/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(!api.state.primaryStorageStats.storageUnit) return;
  return helpers.translateSync("Primary storage used") + " (" + helpers.translateSync(api.state.primaryStorageStats.storageUnit) + ")";
}
