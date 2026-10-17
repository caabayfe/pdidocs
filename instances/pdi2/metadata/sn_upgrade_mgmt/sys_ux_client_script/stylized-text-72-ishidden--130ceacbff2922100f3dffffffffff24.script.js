/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const state = api.data.upgrade_management___get_upgrade_details_1.output?.upgradeMonitorStatusProviderDetails?.state;
	return (api.state.upgradeStage != "In progress") || (api.state.upgradeStartText == null) || (api.state.upgradeStartText == "") || state === 'distUpgrade';
}
