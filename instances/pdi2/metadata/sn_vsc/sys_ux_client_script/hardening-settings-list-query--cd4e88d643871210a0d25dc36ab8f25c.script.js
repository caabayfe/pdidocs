/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const dataVizQuery = api?.state?.dataVizQuery;
  const defaultLoadListFilter = api?.state?.defaultLoadListFilter;
  // Apply data visualization click filter or the default list load filter
  return dataVizQuery || defaultLoadListFilter;
}
