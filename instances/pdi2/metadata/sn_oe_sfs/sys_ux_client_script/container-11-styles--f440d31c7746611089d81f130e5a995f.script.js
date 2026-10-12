/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var styles = api.context.props.payload.props_details.halfWidth ? { "width" : "50%" } : {};
	return styles;
}
