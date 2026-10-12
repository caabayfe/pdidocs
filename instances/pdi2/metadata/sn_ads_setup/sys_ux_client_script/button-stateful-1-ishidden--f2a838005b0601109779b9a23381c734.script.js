/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	if(api.state.detailTask.configuration_types !== "iframe") {
    return true;
  }

  return api.state.isTaskCompleted;
}
