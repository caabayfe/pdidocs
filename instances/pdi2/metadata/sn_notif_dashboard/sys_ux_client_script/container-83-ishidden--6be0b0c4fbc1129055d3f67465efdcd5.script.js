/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.state.mostUsedCategoryJSON.isLoading == false)
    return  api.state.mostUsedCategoryJSON.showError;
  return api.state.mostUsedCategoryJSON.isLoading;
  
	//return api.state.mostUsedCategoryJSON.isLoading && !api.state.mostUsedCategoryJSON.showError;
}
