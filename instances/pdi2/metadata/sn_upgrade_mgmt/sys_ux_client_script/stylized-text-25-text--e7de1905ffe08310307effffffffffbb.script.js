/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return  api.state.upgradeSessionType === 'bulk_app_update'
  ? helpers.translateSync("Reuse a plan created earlier. Import the required update sets to have the configuration needed to evaluate and run the update.")
  : helpers.translateSync("Import update sets to apply or merge upgrade plans for your instance upgrade.");
}
