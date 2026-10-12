/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  console.log(api.context.props)
	return `${api.context.props.patch || ""} Release Notes`;
}
