/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `The ${api.state.resumeUpgradeData?.targetPatch || ""} release at ServiceNow introduces a suite of innovative feature designed to enhance experience.`;
}
