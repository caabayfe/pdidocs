/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const text = api.context.props.templateInput.mainTitle;
  return helpers.translateSync(text);
}
