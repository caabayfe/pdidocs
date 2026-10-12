/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {
    rowSelectionObj
  } = api.state.relProps;
  return !Object.keys(rowSelectionObj).some(key => rowSelectionObj[key]);
}
