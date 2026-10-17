/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	 if(api.state.readerConnectivityResult.data != null && api.state.readerConnectivityResult.data.isError != null && api.state.readerConnectivityResult.data.isError != undefined && api.state.readerConnectivityResult.data.isError)
   return api.state.readerConnectivityResult.data.message;
  else
    return "";
}
