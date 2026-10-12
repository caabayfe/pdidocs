/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.state.template.main_ci_condition)
	  return api.state.template.main_ci_condition.substr(17);
  return '';
}
