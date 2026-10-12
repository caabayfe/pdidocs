/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.props.payload.buttonTooltip ? helpers.translateSync(api.context.props.payload.buttonTooltip) : helpers.translateSync('Copy to clipboard');
}
