/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var op = api.data.result_resource.result.operation.displayValue;
  return op.charAt(0).toUpperCase() + op.slice(1);
}
