/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const translatedValue = helpers.translateSync("Rate end date - row");
	return {"input":{"aria-label":`${translatedValue} ${api.item.index + 1}`}};
}
