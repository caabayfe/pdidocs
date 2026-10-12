/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.context.props.rangeend ? api.context.props.rangeend : api.data.now_datetime_now.output.displayValue;
}
