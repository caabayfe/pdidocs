/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.modalData.progressPercentage) {
    return api.state.modalData.progressPercentage / 100;
  }
  return 0;
}
