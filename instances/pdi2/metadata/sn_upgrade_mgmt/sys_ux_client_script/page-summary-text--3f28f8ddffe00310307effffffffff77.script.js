/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update' 
  ? helpers.translateSync("For faster implementation, enable automation of update tasks. You can review the configurations before applying them.") 
  : helpers.translateSync("For faster implementation, enable automation of upgrade tasks, such as generating ATFs, and upgrading applications to their latest version. you have the opportunity to review the configurations before applying them.");
}
