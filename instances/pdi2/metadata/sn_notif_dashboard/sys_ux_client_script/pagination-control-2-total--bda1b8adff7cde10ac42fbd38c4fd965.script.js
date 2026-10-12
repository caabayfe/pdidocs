/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const leastTriggeredNotificationTotalRecords = api.state.leastTriggeredNotificationTotalRecords || [];
	return leastTriggeredNotificationTotalRecords.length;
}
