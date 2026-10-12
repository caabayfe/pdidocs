/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.state.botIcon == "null") {
    return '';
  }
  else {
    return api.state.botIcon;
  }
}
