/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update'
  ? helpers.translateSync("Start creating a new upgrade plan for your application update. This allows you to set up a plan tailored to your specific needs.")
  : helpers.translateSync("Get started creating a new upgrade plan for your instance upgrade.");
}
