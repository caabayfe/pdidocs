/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if (api.context.props.id !== '-1' && api.data.get_process_detail.result && api.data.get_process_detail.result.label) {
    return api.data.get_process_detail.result.label.displayValue;
  }
	return '';
}
