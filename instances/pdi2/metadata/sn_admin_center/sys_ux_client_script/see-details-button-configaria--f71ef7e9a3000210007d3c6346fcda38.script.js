/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var title = api.item.value.title;
  var ariaLabel = {"button":{"aria-label":"See Details of "+title, "role": "link"}};
	return ariaLabel;
}
