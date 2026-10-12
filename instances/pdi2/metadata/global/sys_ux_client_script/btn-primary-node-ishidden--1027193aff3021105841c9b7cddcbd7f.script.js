/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.data.controller.uiInputConfig.primaryButtonLabel == null || api.data.controller.uiInputConfig.primaryButtonLabel == undefined || api.data.controller.uiInputConfig.primaryButtonLabel == "") {
    return true;
  }
	return false;
}
