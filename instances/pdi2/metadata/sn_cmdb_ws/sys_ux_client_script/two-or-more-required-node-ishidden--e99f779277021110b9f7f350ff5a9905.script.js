/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.queryType != 3 || api.state.query.query_json.diff.type !== 'sourceVsSource')
    return true;
  return (api.state.query.query_json.discovery_sources && api.state.query.query_json.discovery_sources.length > 1);
}
