/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const mostTriggerredNotificationTable = api.state.mostTriggerredNotificationTotalRecords || [];
	return mostTriggerredNotificationTable.length;
}
