/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.contextProps && api.state.contextProps.isTeamsEnabled){
    return false;
  }
	return true;
}
