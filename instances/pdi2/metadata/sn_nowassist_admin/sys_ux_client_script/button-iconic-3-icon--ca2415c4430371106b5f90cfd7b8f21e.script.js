/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.state.openInProductRoleSettings ? 'chevron-down-fill' : 'chevron-right-fill';
}
