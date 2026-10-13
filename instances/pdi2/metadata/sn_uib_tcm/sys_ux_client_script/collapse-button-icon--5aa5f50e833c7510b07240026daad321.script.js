/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var expanded = api.item.value.expanded;
  return expanded ? "chevron-up-outline" : "chevron-down-outline";
}
