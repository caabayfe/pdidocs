/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.data.controller.uiInputConfig.secondaryButtonLabel == null || api.data.controller.uiInputConfig.secondaryButtonLabel == undefined || api.data.controller.uiInputConfig.secondaryButtonLabel == "") {
    return true;
  }
	return false;
}
