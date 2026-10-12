/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if(!api.state.dashboardFilter || api.state.dashboardFilter === '') {
    return 'recent';
  }
  return api.state.dashboardFilter;
}
