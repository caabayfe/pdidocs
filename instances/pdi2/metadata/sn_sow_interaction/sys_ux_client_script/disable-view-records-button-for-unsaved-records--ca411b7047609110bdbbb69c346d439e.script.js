/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(api.context.props.interactionSysId === '-1' || !api.state.isPageSaved)
	   return true;
	else
	   return false;
}
