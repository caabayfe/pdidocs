/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(!api.state.categoryId)
    return (api.data.get_setup_1.output && api.data.get_setup_1.output.result) ? [api.data.get_setup_1.output.result.setup.steps[0].sys_id]  : [];
	return [api.state.categoryId];
}
