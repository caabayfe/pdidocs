/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const error = api.state.error;
    if (!api.state.isDMAnalyticsPluginInstalled)
        return helpers.translateSync('PA New Model Analytics Plugin is not installed');
    else if (error === 'no_score')
        return helpers.translateSync('No scores collected for KPI');
    else if (error === 'invalid_kpi')
        return helpers.translateSync('Invalid KPI');
    else
        return helpers.translateSync('Error retrieving KPI data');
}
