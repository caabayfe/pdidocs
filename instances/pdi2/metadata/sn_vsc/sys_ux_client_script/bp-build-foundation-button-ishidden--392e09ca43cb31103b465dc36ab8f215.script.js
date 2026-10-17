/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.state.isNew != null) {
    return api.state.isNew == true ? false : true;
  } else {
    return true;
  }
}
