/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return api.data.lp_record.result && api.data.lp_record.result.name ? api.data.lp_record.result.name.displayValue : '';
}
