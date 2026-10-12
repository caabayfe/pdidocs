/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return 'Issue Auto Resolution is now successfully enabled for ' + api.data.gliderecord_query.output.data.GlideRecord_Query.sys_cs_auto_resolution_configuration._results[0].target_table_name.displayValue +  ' - you are an automation Pro!';
}
