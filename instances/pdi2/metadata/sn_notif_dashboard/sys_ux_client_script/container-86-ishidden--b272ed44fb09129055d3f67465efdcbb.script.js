/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  	if(api.state.newNotificationsCount.isLoading == false)
    return  api.state.newNotificationsCount.showError;
  return api.state.newNotificationsCount.isLoading;
}
