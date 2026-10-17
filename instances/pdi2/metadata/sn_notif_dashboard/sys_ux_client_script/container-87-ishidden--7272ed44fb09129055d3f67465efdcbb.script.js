/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  	if(api.state.oldNotificationsCount.isLoading == false)
    return  api.state.oldNotificationsCount.showError;
  return api.state.oldNotificationsCount.isLoading;
}
