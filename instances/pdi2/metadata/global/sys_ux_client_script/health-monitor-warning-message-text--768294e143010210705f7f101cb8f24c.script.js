/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var status = api.data.get_operation_queue_status_1.output.healthMonitorStatus;
  if (!status) {
    return 'The health monitor is disabled meaning the queue cannot run. Try enabling the App Operation Queue Health Monitor and try again';
  }
	return '';
}
