/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.useraccountInRepeater)
    return true;
  return api.state.scopeRestrictionStatusRecommendationDisabled == "restricted";
}
