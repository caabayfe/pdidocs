/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var query = api.context.props.query;
  var sort = api.context.props.sort;
  
  if (query != undefined && query != null) {
    if (sort != undefined && sort != null) {
      return query + '^' + sort;
    }
     return query;
  }
  if (sort != undefined && sort != null) {
    return sort;
  }
}
