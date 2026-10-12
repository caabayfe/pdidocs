/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.context.props.rangestart ? api.context.props.rangestart : api.data.now_datetime_24_hours_ago.output.displayValue;
}
