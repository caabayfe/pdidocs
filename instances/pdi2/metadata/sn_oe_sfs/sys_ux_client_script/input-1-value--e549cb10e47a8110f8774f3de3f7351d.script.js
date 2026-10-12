/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.state.botName == null || api.state.botName == "null" || api.state.botName == undefined) {
      return 'Now Virtual Agent';
    }
	else {
    return api.state.botName;
  }
}
