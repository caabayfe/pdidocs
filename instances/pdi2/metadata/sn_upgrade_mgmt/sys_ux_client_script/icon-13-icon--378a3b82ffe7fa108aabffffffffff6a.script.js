/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var isActiveBulkSession = api.state.isActiveBulkSession;
	return isActiveBulkSession ? 'loader-fill' : 'sync-outline';
}
