/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  	if(api.state.optedOutInfo.isLoading == false)
    return  api.state.optedOutInfo.showError;
  return api.state.optedOutInfo.isLoading;
}
