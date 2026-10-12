/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(!api.state.isProcessingClicked){
    return "Please click on \"check app compatibility\" before proceeding";
  }
	return "Mark as complete";
}
