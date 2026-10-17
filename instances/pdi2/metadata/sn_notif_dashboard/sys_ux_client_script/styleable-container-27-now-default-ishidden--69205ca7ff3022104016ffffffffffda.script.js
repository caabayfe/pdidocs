/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.senderConnectivityResult.isLoading != null && api.state.senderConnectivityResult.isLoading != undefined && api.state.senderConnectivityResult.isLoading)
	return false;
  else
   return true;
}
