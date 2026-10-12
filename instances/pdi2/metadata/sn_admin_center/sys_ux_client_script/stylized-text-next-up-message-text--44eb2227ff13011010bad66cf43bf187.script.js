/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.props.payload.pageParams.pageData.nextUpCardData.status ? helpers.translateSync('For your next step, we recommend you complete the Guided Setup for ') : helpers.translateSync('For your next step, we recommend you evaluate and install ');
}
