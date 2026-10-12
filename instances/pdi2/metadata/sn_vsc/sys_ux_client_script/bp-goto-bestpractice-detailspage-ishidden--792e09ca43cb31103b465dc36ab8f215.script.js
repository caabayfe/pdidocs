/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.state.isNew != null) {
    return api.state.isNew == true ? true : false;
  } else {
    return true;
  }
}
