/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.isProcessing)
    return "Processing App Updates";
	return "Loading preview of store app updates";
}
