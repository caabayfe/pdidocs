/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if (api.state.returningUser && api.state.setupStatus.type === 'recommended' && api.state.setupStatus.timeStamp) return false;
	return true;
}
