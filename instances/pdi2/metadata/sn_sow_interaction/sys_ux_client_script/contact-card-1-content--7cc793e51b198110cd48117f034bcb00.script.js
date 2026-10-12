/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
    var response = '';

    if (api.data.lp_record.result 
    && api.data.lp_record.result.location 
    && api.data.lp_record.result.location._reference 
    && api.data.lp_record.result.location._reference.city.displayValue) {
        response = api.data.lp_record.result.location._reference.city.displayValue;
    }

    if (api.data.now_timezone.output) {
    	if (response)
    		response += ' • ';
        response += api.data.now_timezone.output;
    }

    return [{
        "label": response
    }];
}
