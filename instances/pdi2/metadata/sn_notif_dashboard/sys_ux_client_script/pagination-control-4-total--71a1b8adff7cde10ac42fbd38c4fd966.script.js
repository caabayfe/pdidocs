/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const unusedNotificationTotalRecords = api.state.unusedNotificationTotalRecords || [];
	return unusedNotificationTotalRecords.length;
}
