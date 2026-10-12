/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.selectedRecommendedActivity?.length == 0){
    return true;
  }
	return Boolean(!api.state.selectedRecommendedActivity?.grouped);
}
