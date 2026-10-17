/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return !api.state.customEventValid.isDateTimeValid || !api.state.customEventValid.isMessageValid || api.state.customEvent.message == "" || isNaN(new Date(api.state.customEvent.timestamp));
}
