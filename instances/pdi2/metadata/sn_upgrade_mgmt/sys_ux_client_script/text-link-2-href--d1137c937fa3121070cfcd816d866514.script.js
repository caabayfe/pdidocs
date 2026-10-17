/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return '/sys_skipped_record_rule_history_list.do?sysparm_query=upgrade_history=' + api.state.upgradeHistorySysId + '^rule_id.action=1^ORrule_id.action=2^source=1^records_impacted>0';
}
