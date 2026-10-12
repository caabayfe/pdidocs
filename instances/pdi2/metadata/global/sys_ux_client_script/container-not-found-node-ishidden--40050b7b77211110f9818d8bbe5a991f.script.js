/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(Array.isArray(api.data.look_up_records_1.results) && api.data.look_up_records_1.results.length > 0 && typeof api.data.look_up_records_1.results[0] === 'object'){
    return true;
  }
	return false;
}
