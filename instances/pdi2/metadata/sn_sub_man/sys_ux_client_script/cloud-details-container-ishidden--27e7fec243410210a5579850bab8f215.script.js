/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.showCloudDetailsContainer === "false" || api.state.subscriptionsTabId != 'p2c1';
}
