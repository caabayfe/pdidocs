/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  	if(api.state.triggerCountByIdJSON.isLoading == false)
    return  api.state.triggerCountByIdJSON.showError;
  return api.state.triggerCountByIdJSON.isLoading;
}
