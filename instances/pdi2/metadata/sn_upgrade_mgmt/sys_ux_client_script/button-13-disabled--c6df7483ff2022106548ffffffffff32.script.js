/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.updateState === "pending" || api.state.updateState === "running" || api.state.updateState === "distUpgrade";
}
