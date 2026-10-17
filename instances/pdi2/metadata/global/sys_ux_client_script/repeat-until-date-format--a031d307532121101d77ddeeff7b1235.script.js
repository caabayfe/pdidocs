/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.session.user.dateFormat.replaceAll('d', 'D').replaceAll('y', 'Y');;
}
