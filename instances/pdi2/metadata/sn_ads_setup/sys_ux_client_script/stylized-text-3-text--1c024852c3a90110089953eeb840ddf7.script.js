/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api, helpers}) {
  const step = api.state.stepToDelete;
  if(!step)
    return '';
  if (step.id == api.state.pluginCatInfo.id || step.id == api.state.pluginCatInfo.installPluginTaskId) {
    return helpers.translateSync('Delete Category - {0}', api.state.pluginCatInfo.name);
  }
  return helpers.translateSync('Delete {0} - {1}', step.lane_id ? 'Task' : 'Category', step.name);
}
