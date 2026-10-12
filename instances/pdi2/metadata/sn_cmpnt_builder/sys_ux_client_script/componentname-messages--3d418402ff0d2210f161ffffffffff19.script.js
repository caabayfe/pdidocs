/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const content = api.state.cbValidationError;
	return content ? [{
    content,
    status: 'critical',
    icon: 'exclamation-triangle-outline'
  }] : null;
}
