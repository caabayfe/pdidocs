/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.state.mostTriggeredNotificationJSON.isLoading == false)
    return  api.state.mostTriggeredNotificationJSON.showError;
  return api.state.mostTriggeredNotificationJSON.isLoading;
}
