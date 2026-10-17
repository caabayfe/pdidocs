/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  	if(api.state.unsubscribeCountJSON.isLoading == false)
    return  api.state.unsubscribeCountJSON.showError;
  return api.state.unsubscribeCountJSON.isLoading;
}
