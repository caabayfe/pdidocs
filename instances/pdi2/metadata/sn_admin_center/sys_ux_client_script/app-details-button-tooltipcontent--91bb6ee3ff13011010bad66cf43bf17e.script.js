/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.props.payload.pageParams.pageData.nextUpCardData.status ? helpers.translateSync('Go to guided setup for application') : helpers.translateSync('See application details');
}
