/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.senderConnectivityResult.data != null && api.state.senderConnectivityResult.data.isError != null && api.state.senderConnectivityResult.data.isError != undefined && !api.state.senderConnectivityResult.data.isError)
	return false;
  else
   return true;
}
