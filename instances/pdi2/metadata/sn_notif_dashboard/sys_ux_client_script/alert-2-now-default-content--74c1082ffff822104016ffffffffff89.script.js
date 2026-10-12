/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.state.senderConnectivityResult.data != null && api.state.senderConnectivityResult.data.isError != null && api.state.senderConnectivityResult.data.isError)
   return api.state.senderConnectivityResult.data.message;
  else
    return "";
}
