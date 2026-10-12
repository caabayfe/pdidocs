/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(!api.data.gform.nowRecordFormBlob) {
    return;
  }
  
  return api.data.gform.nowRecordFormBlob.detailsProps;
}
