/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update'
  ? helpers.translateSync("Build a fresh upgrade plan as you complete this update. Your actions are automatically captured and turned into a reusable plan that streamlines future app updates or instance upgrade.")
  : helpers.translateSync("It'll automatically be applied to this upgrade.");
}
