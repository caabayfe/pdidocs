/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(!api.data.ms_allow_query_edit.output)
    return true;

  if(api.state.dataActivity)
    return true;

  if(parseInt(api.state.currentStep) === api.state.stepperConfig.length && api.state.stepperConfig[api.state.currentStep -1].progress === "none") {      
    return true;
  }
      
  
  return false;

}
