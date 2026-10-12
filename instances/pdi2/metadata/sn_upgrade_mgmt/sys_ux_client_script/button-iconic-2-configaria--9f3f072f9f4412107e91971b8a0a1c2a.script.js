/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return {"button":{"role":"link","aria-label":helpers.translateSync("{0} documentation Opens in new window or tab",api?.item?.value?.headerText)}};
}
