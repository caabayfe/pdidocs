/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Disable dropdown if only one task type
  const taskTypes = api.data.fetch_knowledge_gaps_task_type_data.results;
  return taskTypes.length == 1;
}
