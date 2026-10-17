/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update'
  ? helpers.translateSync("You can select a single plan or merge multiple plans into one. The selected plan will be used for this update and for future updates, providing a consistent way to manage updates and activities.")
  : helpers.translateSync("You can select a single plan or choose multiple plans to merge them into one. The plan you select will be used for this upgrade and carried forward into future upgrades, giving you a consistent way to manage updates and activities.");
}
