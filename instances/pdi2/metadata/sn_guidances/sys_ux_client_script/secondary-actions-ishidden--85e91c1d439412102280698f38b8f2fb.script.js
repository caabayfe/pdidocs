/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  //Hide secondary action
	if( api.state.actionStateValue === 'new'){
    return false;
  }
  return true;
}
