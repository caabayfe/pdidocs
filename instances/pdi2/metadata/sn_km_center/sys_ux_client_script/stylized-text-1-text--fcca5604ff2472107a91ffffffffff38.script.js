/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.taskData.selectedGapSysIds.length == 0) {
    return helpers.translateSync("All tasks will be skipped because Knowledge Gap was already reported for them.");  
  }

  let skippedTasksString = api.state.taskData.skippedTasks.map(task => task.name).join(", ");
  let skippedTaskCount = api.state.taskData.skippedTasks.length;
  if (skippedTaskCount == 1) {
    return helpers.translateSync("Task {0} will be skipped because Knowledge Gap was already reported for it.", [skippedTasksString]);
  }

  return helpers.translateSync("Tasks {0} will be skipped because Knowledge Gap was already reported for them.", [skippedTasksString]);  
}
