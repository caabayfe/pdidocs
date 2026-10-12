/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const shouldHighlight = api.context.props.payload.props_details.highlight;
  return !!(shouldHighlight == true || shouldHighlight == 'true');
}
