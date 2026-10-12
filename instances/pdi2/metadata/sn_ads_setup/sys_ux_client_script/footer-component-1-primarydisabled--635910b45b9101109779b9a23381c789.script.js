/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(api.state.disablePA) {
    return true;
  }

  if(api.state.detailTask.configuration_types === "table" && !api.state.isTaskCompleted)
    return false;
    
  if(api.state.detailTask.configuration_types === "install_plugin") {
    if(api.state.installPlugins.length > 0) {
      return false;
    }
    return true;
  }
  return !api.state.markAsComplete || api.state.isTaskCompleted;
}
