/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	var response = [];
    if (api.data.lp_record.result && api.data.lp_record.result.vip && api.data.lp_record.result.vip.value)
        response.push({'label': "VIP", "color": "positive"});
  return response;
}
