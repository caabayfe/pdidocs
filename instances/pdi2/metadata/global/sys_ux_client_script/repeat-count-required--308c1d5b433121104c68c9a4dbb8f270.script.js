/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return ['daily', 'weekly', 'monthly', 'yearly', 'specific'].includes(api.state.repeatType);
}
