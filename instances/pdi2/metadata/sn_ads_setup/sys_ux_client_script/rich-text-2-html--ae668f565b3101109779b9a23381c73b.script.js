/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api, helpers}) {
	const step = api.state.stepToDelete;
  if (step && step.dependents && step.dependents.length) {
    var dependentNames = step.dependents.map(dependent => dependent.name);
    
   return ` <p style="font-size:16px;line-height:20px">
    ${helpers.translateSync('<strong>Note:</strong> {0} unlocks on completion of {1}.</br>', dependentNames.toString(), step.lane_id ? step.name : 'tasks in this category')}
    <span>${helpers.translateSync('This dependency will also be deleted')}.</span>
    </p>`;
  }
  if (!step || !step.dependencies || !step.dependencies.length) 
    return '';
  
  return ` <p style="font-size:16px;line-height:20px">
    ${helpers.translateSync('<strong>Note:</strong> {0} unlock on completion of {1}.</br>', step.lane_id ? step.name : 'tasks in this category', step.dependencies.toString())}
    <span>${helpers.translateSync('This dependency will also be deleted')}.</span>
    </p>`;
}
