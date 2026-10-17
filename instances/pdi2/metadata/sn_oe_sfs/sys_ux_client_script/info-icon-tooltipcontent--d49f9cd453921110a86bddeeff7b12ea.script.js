/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync(`Choose the font family to be applied to chat ${api.context.props.fontApplicationSection}.`);
}
