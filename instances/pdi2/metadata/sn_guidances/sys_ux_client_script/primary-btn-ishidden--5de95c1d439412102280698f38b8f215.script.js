/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Hide primary CTA button
    if(api.state.actionStateValue === "new"){
      return false;
    }
	return true;
}
