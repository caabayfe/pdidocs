/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var ariaLabel = helpers.translateSync("Next up, About this recommendation");
	return {"button":{"aria-label":ariaLabel}};
}
