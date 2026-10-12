/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const roleMaskingData = api.state.roleMaskingData;
  return roleMaskingData?.roles?.length > 0;
}
