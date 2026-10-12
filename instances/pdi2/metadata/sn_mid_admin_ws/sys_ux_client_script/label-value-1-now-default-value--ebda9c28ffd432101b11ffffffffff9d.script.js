/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var value = '';
  var midRecInfo = api.data.mid_server_look_up_a_single_record.result;
  var status = midRecInfo.status.value;
  switch (status) {
    case 'Up': value = midRecInfo.started.displayValue;
    break;
    case 'Down': value = midRecInfo.stopped.displayValue;
    break;
    default: value = midRecInfo.last_refreshed.displayValue;
    break;
  }
	return value;
}
