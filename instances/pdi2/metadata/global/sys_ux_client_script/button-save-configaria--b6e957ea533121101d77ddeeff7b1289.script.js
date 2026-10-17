/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const ariaLabel = api.context.props.scheduleSpanSysId != "-1" ? helpers.translateSync("Update") : helpers.translateSync("Submit");
  return {"button":{"aria-label":ariaLabel}};
}
