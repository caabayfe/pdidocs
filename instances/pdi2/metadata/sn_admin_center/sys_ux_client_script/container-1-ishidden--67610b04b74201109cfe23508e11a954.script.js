/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var payload = api.context.props.payload;
	return !(payload && payload.children && payload.children.length > 0);
}
