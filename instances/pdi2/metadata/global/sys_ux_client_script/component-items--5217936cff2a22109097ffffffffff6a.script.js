/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(!api.data.contentTreeItems) return;
	return api.data.contentTreeItems[api.data.selectedRuleType];
}
