/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	  if (api.state.projectData?.miningState?.value) {
        return api.state.projectData.miningState.value === 'AVAILABLE' ? 'positive' : api.state.MINING_STATE[api.state.projectData.miningState.value].color;
    }
}
