/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let count = api.state.origRowData.rows?.reduce((acc, row) => {
    if(row.isSelected === true){
      return acc + 1;
    }else
      return acc;
  }, 0)
  return count === 0 || api.state.isProcessing || api.state.performingAction || api.state.activityState !== "IN_PROGRESS";
}
