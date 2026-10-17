/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return !(api.context.props.payload.guided_context.show_in_mobile_card == "true");
}
