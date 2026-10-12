/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var key = '';
  var status = api.data.mid_server_look_up_a_single_record.result.status.value;
  switch (status) {
    case 'Up': key = "Started: ";
    break;
    case 'Down': key = 'Stopped: ';
    break;
    default: key = 'Last refreshed:';
    break;
      
  }
	return key;
}
