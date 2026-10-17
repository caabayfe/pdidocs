/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const knowledgeArticle = api.data.playbook_activity_ui.knowledgeArticle;
  if(!knowledgeArticle || !Object.keys(knowledgeArticle).length) return true;

  const snippet = knowledgeArticle.snippet;
  const alertMessage = knowledgeArticle.alertMessage;
  
  if(!snippet && !alertMessage) return true;
  if(snippet) return true;
  if(alertMessage) return false;
}
