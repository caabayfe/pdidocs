/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.data.controller.uiInputConfig.heading == null || api.data.controller.uiInputConfig.heading == undefined || api.data.controller.uiInputConfig.heading == "") {
    return true;
  }
	return false;
}
