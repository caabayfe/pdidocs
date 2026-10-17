/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var query = api.state.listQueryEditable;
  var baseQuery = api.state.listQuery;
  if (query) {
    // remove the query that should already be a part of the filter
    query = query.replaceAll(baseQuery, '');
    // remove ^ from start and end
    query = query.replace(/^\^/, '').replace(/\^$/, '');
  }
  var order = 'ORDERBYDESCsetting_set_setting.compliance_status^ORDERBYDESCsetting_set_setting.score_impact';
  if (query) {
    return query + '^' + order;
  }
  return order;
}
