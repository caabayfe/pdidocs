/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return api.state.available_versions.length < 2;
}
