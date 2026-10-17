/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let count = 0;
  if(api.state.origRowData.rows)
    count = api.state.origRowData.rows?.reduce((acc, row) => row.isSelected === true? acc + 1: acc, 0)
  
  return helpers.translateSync("Set to latest ({0})", count);
}
