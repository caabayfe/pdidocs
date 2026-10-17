/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Had to use multiple If statements to get code to save.
  if(String(api.state.queryType) == "1") {
    if(api.state.query.query_json.class_conditions.length === 1 && api.state.query.query_json.class_conditions[0].allClasses) {
        return api.state.classData.available;
    } else {
        return api.state.classData.availableWithAllOption;
    }
  }
  return api.state.classData.available;
}
