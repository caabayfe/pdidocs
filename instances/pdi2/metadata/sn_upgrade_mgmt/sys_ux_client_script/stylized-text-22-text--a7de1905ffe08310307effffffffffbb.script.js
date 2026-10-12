/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return  api.state.upgradeSessionType === 'bulk_app_update'
  ? helpers.translateSync("An upgrade plan records your update decisions once so you can apply them consistently across multiple environments without repeating the same choices. It’ll also reduce manual update set transfers and avoid repeating skip resolutions.")
  : helpers.translateSync("These plans help you organize and track the related tasks, updates and configuration in an upgrade.");
}
