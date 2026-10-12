/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.data.controller.uiInputConfig.subheading == null || api.data.controller.uiInputConfig.subheading == undefined || api.data.controller.uiInputConfig.subheading == "") {
    return true;
  }
	return false;
}
