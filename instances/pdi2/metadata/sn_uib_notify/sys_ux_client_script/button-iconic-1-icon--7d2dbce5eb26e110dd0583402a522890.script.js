/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.state.joinedParticipantCollapse){
    return "chevron-up-fill";
  }
  else {
    return "chevron-down-fill";
  }
}
