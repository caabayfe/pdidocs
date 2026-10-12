/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return {
    page: 'adoption-blueprint-details',
    businessObjectiveName: api.state.businessObjectiveName
  };
}
