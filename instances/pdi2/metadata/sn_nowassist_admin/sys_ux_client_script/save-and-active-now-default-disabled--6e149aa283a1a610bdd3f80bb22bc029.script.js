/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.data.nowassistadminuser_1.output){
      return true;
  }
  return api?.state?.disableSaveAndActive;
}
