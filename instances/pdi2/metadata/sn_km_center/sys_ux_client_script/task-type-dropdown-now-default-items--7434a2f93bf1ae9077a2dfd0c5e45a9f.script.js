/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const allTypes = [];
  allTypes.push(...api.data.fetch_knowledge_gaps_task_type_data.results);

	return allTypes;
}
