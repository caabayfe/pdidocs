/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.get_current_scope_1.scopeData != null && api.data.get_current_scope_1.scopeData.sysId != api.state.notificationScope;
  
}
