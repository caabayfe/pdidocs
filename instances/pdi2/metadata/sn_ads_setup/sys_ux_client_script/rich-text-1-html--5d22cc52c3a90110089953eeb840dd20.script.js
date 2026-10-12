/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api, helpers}) {
  const step = api.state.stepToDelete;
  if(!step)
    return '';

  const stepType = step.lane_id ? 'task' : 'category';
  let warningText = `<p>${helpers.translateSync('Are you sure you want to delete the {0} <strong>{1}</strong> {2} {3}', stepType, step.name, step.lane_id ? '<strong>?</strong>' : helpers.translateSync('and task within it?'))}</p>`;

  if (step.id == api.state.pluginCatInfo.id || step.id == api.state.pluginCatInfo.installPluginTaskId) {
    if (step.hasOwnProperty('isPluginCategory')) {
      warningText = `<p>${helpers.translateSync('You are about to delete the <strong>{0}</strong> category. It will delete <strong>{1}</strong> task within the category.', api.state.pluginCatInfo.name, api.state.pluginCatInfo.installPluginTaskName)}</p>`;
    } else {
      warningText = `<p>${helpers.translateSync('You cannot delete only the <strong>{0}</strong> task. It will delete the entire <strong>{1}</strong> category.', step.name, api.state.pluginCatInfo.name)}</p>`;
    }
  }
  
  return `<div style="font-size:16px;line-height:20px">
    ${warningText}
    <p>${helpers.translateSync('This cannot be undone.')}</p>
  </div>`;
}
