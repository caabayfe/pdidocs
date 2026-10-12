/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.context.props.isConfigured) {
    return 'Check Circle Outline';
  }
	return 'Triangle Exclamation Outline';
}
