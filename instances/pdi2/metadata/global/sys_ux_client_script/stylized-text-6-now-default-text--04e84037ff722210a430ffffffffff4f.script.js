/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var status = api.data.instance_scan_queue_status_1.output.healthMonitorStatus;
  if (status) {
    return helpers.translateSync("Active");
  }
	return helpers.translateSync("Disabled");
}
