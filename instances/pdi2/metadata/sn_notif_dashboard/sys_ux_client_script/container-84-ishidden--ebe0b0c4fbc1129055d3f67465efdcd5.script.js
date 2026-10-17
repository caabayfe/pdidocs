/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  	if(api.state.unusedNotificationsJSON.isLoading == false)
    return  api.state.unusedNotificationsJSON.showError;
  return api.state.unusedNotificationsJSON.isLoading;
}
