/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.check_if_knowledge_article_is_attached_to_incident_1 ? (typeof api.data.check_if_knowledge_article_is_attached_to_incident_1.output == "undefined" ? true : api.data.check_if_knowledge_article_is_attached_to_incident_1.output): true;
}
