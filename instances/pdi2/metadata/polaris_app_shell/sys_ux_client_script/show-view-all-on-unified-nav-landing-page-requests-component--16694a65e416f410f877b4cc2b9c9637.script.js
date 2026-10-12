/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if (api.state.hideMyRequestsViewAll)  { 
    return '';
  }
	return api.state.viewAll;
}
