/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const translatedTabSelection = api.state.reqAttentionTabContent;
  const tabSelection = api.state.reverseTranslations[translatedTabSelection];
  return !["My Flagged", "Articles expiring in 90 days"].includes(tabSelection);
}
