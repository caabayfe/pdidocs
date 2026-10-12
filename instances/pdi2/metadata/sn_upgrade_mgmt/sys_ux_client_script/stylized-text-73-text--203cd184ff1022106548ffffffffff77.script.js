/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `The ${api.state.currentVersion || ""} release at ServiceNow introduces a suite of innovative feature designed to enhance experience.`;
}
