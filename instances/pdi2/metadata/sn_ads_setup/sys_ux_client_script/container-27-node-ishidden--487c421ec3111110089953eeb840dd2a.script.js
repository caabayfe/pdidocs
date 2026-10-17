/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	return (!api.state.taskView || !(api.state.selectedTaskStep === 2)) || !api.state.isPluginStoreCategory;
}
