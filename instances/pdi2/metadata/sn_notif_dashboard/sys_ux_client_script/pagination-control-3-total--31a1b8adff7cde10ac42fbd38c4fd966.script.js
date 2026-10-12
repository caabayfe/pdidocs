/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const mostOptOutTriggerredNotificationTotalRecords = api.state.mostOptOutTriggerredNotificationTotalRecords || [];
	return mostOptOutTriggerredNotificationTotalRecords.length;
}
