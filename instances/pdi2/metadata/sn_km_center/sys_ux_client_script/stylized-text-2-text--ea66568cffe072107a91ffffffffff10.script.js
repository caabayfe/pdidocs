/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const description = api.state.taskData.description;
  const numberOfTasks = api.state.taskData.selectedTasks.length;
  let taskWord = "task";
  if (numberOfTasks > 1) {
    taskWord = "tasks";
  }
  return helpers.translateSync('A feedback task will be created to report {0} selected {1} under "{2}" as a knowledge gap.', [numberOfTasks, taskWord, description]);
}
