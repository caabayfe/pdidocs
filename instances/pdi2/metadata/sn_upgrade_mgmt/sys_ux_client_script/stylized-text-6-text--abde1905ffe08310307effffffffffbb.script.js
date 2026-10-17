/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update'
  ? helpers.translateSync("Select imported update sets to configure. You'll need to import update sets before selecting an existing upgrade plan.")
  : helpers.translateSync("Select import update sets to review, configure and import. You'll need to import update sets before selecting an existing upgrade plan.");
}
