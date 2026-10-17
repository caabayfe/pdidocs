/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
 return api.state.query.query_json.results_filter.values.length > 0 ? api.state.query.query_json.results_filter.values[0] : "";
}
