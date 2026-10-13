/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.confDetails.active){
    return api.state.conferenceDuration;
  }
	return api.state.confDetails.callDuration;
}
