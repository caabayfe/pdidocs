/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.context.props.data && api.context.props.data.props_details
    ? api.context.props.data.props_details.image
    : '/now-image-placeholder.jpg';
}
