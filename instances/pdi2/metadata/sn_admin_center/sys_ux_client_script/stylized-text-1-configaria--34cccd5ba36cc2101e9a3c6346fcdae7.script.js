/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var ariaLabel = helpers.translateSync("Recommended applications installed");
	return {"input":{"aria-label":ariaLabel}};
}
