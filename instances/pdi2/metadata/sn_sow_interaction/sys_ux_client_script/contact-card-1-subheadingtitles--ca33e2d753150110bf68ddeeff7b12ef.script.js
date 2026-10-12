/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	if (!api.data.lp_record.result)
    return [{
        "label": ""
    }];
  var title = api.data.lp_record.result.title ? api.data.lp_record.result.title.displayValue : '';
  var dep = api.data.lp_record.result.department ? api.data.lp_record.result.department.displayValue : '';
  // seperator "•"
  var response = '';
  if (title)
    response = title;
    
  if (dep) {
    if (response)
      response +=  " · ";
    response += dep;
  }    
  return [{
      "label": response
  }];
}
