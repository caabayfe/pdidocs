/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.isTeamsConfigured && api.state.setupStatus == "incomplete")
	  return 'loader_outline';
  return '';
}
