/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const props = api.context.props.payload.props_details;

  return `<hr style='border-color:${props.color}' width='${props.length}%' size='1px' noshade />`;
}
