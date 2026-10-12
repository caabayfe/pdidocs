/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.context.props.payload && api.context.props.payload.props_details
    ? api.context.props.payload.props_details.image
    : '/now-image-placeholder.jpg';
}
