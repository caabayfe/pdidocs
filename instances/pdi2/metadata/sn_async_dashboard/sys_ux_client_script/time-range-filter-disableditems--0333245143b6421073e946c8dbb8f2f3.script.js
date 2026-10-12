/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var sevenDaysAgo = api.data.now_datetime_7_days_ago.output.utcDate + ' 00:00:00';
  var future = api.data.now_datetime_future.output.utcDate + ' 23:59:59';
	return [
    {
      before: sevenDaysAgo
    },
    {
      after: future
    }
  ];
}
