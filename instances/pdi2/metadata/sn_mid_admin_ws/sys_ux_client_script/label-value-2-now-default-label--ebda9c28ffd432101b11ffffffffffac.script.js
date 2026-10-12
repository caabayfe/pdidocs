/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var key = '';
  var validated = api.data.mid_server_look_up_a_single_record.result.validated.value;
  switch (validated) {
    case "false":
    if (api.data.mid_server_look_up_a_single_record.result.invalidated_at.value) {
      key = 'Invalidated:';
    }
      break;
    case 'true':
      key = 'Validated:';
      break;
  }
	return key;
}
