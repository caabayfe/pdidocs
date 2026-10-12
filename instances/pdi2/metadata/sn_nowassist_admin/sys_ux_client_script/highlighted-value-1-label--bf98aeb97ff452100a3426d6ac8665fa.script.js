/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.deploymentChannels ? api.state.deploymentChannels.filter(item=>item.isActive).length : 0;
}
