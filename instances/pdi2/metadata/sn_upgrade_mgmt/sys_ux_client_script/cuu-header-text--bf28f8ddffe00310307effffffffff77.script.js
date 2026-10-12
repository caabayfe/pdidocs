/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update' 
  ? helpers.translateSync("Create update sets") 
  : helpers.translateSync("Create Upgrade Update Sets");
}
