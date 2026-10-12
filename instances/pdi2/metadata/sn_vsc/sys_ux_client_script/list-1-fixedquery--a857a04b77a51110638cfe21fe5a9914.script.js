/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return 'last_login_timeISEMPTY^sys_created_on<javascript:gs.beginningOfLast30Days()';
}
