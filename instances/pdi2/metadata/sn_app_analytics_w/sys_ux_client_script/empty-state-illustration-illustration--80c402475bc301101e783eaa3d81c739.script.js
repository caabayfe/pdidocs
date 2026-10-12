/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const error = api.state.error;
  if(!api.state.isDMAnalyticsPluginInstalled)
	  return 'error';
  else if(error === 'no_score')
    return 'no-data';
  else if(error === 'invalid_kpi')
    return 'no-search-results';
  else
    return 'offline';
}
