/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	  return api.context.props.title ? api.context.props.title : helpers.translateSync('Related records');
}
