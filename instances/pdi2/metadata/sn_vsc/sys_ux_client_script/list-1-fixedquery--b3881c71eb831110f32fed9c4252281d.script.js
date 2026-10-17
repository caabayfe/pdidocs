/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var filter = api.context.props.listFilter;
	return decodeURIComponent(filter);
}
