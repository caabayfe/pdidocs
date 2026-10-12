/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.detailTask.configuration_types !== "table") {
    return true;
  }
  if(api.state.isLocked)
    return false;
  
  return !api.state.isTaskCompleted;
}
