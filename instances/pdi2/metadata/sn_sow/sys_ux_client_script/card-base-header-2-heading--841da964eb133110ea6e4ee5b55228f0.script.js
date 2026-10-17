/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return {
    "label": api.item.value.name.displayValue,
    "size":"sm"
  };
}
