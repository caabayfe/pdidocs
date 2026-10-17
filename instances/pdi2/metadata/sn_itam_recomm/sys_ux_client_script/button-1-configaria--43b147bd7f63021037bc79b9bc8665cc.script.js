/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var content = api.item.value.buttonTooltip;
  return {"button":{"aria-label":content}};
}
