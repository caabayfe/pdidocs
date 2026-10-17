/**
  * @param {params} params 
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return new Date(api.item.value.due_date.value.replace(" ", "T") + "Z").valueOf();
}
