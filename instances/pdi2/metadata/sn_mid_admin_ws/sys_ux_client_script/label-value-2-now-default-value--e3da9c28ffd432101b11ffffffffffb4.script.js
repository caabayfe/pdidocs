/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var value = '';
  var midRecInfo = api.data.mid_server_look_up_a_single_record.result;
  var validated = midRecInfo.validated.value;
  switch (validated) {
    case 'false': 
      if (api.data.mid_server_look_up_a_single_record.result.invalidated_at.value) {
        value = midRecInfo.invalidated_at.displayValue;
      }
      break;
    case 'true': 
      value = midRecInfo.validated_at.displayValue;
      break;
  }
	return value;
}
