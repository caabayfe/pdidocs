/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return !api.state.hasPermissions
    || api.item.value.table.value == 'syslog'
    || api.item.value.table.value == 'syslog_app_scope'
    || api.item.value.table.value == 'protected_table_configuration';
}
