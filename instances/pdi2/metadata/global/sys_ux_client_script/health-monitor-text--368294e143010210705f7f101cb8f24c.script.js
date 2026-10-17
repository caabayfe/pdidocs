/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var status = api.data.get_operation_queue_status_1.output.healthMonitorStatus;
  if (status) {
    return 'Active';
  }
	return 'Disabled';
}
