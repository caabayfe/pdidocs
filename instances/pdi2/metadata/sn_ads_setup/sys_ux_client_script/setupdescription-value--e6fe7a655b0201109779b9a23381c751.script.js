/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  var processDetail = api.data.get_process_detail.result;
  if (api.context.props.id !== '-1' && api.data.get_process_detail.result && api.data.get_process_detail.result.description) {
    return api.data.get_process_detail.result.description.displayValue;
  }
	return '';
}
