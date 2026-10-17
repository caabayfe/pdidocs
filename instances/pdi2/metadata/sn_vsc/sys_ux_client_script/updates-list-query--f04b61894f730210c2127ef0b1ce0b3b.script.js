/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var filterQuery = 'up_active=true^up_update_status!=acknowledged';
  var propQuery = api?.context?.props?.filterQuery;
  if (propQuery != '') {
    return propQuery;
  }
  return filterQuery;
}
