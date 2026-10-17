/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
   if( parseInt(api.state.currentStep) === api.state.stepperConfig.length)
        return true;
  return api.state.stepperConfig[api.state.currentStep].disabled;
}
