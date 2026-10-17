/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(!api.data.get_setup_1.output || !api.data.get_setup_1.output.result)
    return;
    
	return !api.data.get_setup_1.output.result.setup.isComplete;
}
