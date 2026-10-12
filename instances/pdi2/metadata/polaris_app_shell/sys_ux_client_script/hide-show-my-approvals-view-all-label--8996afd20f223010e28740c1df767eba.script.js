/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if (api.state.hideMyApprovalsViewAll)  { 
    return '';
  }
	return api.state.viewAll;
}
