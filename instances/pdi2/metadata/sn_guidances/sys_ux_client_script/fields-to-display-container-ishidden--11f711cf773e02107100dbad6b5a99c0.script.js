/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // hide fields to display.
   var actionStateValue = api.state.actionStateValue;
   if(actionStateValue=='new'||actionStateValue=="in_error"){
    return false;
   }
	return true;
}
