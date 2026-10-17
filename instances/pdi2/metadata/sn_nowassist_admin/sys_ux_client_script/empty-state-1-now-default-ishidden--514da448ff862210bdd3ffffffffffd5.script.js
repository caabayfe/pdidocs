/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api?.state?.showInstanceImpactCount || (api?.state?.customSelectedItems?.length > 0);
}
