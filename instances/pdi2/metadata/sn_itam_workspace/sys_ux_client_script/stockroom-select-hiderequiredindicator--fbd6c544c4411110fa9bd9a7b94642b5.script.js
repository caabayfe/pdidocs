/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	var currentStockroom = api.state.currentStockroom;
	return (currentStockroom ? true : false);
}
