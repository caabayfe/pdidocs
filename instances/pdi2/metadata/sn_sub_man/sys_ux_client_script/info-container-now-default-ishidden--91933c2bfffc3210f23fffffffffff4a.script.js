/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return api.data.getallocationvisibiltystatus_1.output || !api.data.instancehasperuserentitlement_1.output;
}
