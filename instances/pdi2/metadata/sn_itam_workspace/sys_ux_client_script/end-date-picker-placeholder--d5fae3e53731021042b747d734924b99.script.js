/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var format = api.context.session.user.dateFormat.toUpperCase();
	return format.toUpperCase();
}
