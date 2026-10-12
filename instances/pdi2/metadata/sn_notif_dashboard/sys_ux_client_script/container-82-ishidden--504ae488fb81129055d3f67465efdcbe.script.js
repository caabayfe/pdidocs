/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.state.mostOptedOutNotificationJSON.isLoading == false)
    return  api.state.mostOptedOutNotificationJSON.showError;
  return api.state.mostOptedOutNotificationJSON.isLoading;
}
