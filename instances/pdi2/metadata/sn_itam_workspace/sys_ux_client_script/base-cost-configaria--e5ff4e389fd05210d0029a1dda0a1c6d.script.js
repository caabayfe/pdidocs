/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const translatedText=helpers.translateSync("Base cost - row");
	return {"input":{"aria-label":`${translatedText} ${api.item.index + 1}`}};
}
