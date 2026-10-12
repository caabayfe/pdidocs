/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return '/upgrade_preview_log_list.do?sysparm_query=preview%3D' + api.state.previewingVersionSysId;
}
