/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const recordData = [];
  api.data.agent_usecase_lookup.results
    .forEach( ele => recordData.push({"label":ele._row_data.displayValue,"id": ele._row_data.uniqueValue}));
  return recordData;
}
