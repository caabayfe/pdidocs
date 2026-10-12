/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return {
    label : api.state.page_empty_state.errorType
  };
}
