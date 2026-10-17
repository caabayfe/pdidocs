/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const maxKnowledgeBasesToDisplay = 6;
  return api.data.fetch_knowledge_bases_widget_data.bases.slice(0,maxKnowledgeBasesToDisplay);
}
