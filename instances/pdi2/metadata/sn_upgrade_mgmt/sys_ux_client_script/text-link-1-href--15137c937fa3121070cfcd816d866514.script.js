/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return '/sys_upgrade_history.do?sys_id=' + api.state.upgradeHistorySysId;
}
