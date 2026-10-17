/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.data.get_current_scope_1.scopeData != null && api.data.get_current_scope_1.scopeData.sysId != api.state.notificationScope)
    return helpers.translateSync("Deactivation is disabled as you are not in the record's scope, modify the scope to enable deactivation");
  return helpers.translateSync('Deactivate Notification');
}
