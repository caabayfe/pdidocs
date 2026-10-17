/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.readerConnectivityResult.isLoading != null && api.state.readerConnectivityResult.isLoading != undefined && !api.state.readerConnectivityResult.isLoading)
	return false;
  else
   return true;
}
