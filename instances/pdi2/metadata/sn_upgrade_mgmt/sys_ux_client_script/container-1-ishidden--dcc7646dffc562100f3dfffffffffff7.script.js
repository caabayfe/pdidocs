/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	// Hide when upgradeStage is NOT "Scheduled"
	// Return true to HIDE, false to SHOW
	const shouldHide = api.state.upgradeStage !== "Scheduled";
	return shouldHide;
}
