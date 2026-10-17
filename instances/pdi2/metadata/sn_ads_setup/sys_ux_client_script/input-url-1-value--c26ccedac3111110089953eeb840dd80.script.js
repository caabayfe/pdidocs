/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return api.state.pageInput.step2 ? api.state.pageInput.step2.url : '';
}
