/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.query.query_json.class_conditions.length === 1 && api.state.query.query_json.class_conditions[0].allClasses)
    return true;
  return false;
}
