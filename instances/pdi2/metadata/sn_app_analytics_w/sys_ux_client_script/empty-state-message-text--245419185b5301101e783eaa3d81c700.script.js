/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const error = api.state.error;
    if (!api.state.isDMAnalyticsPluginInstalled)
        return helpers.translateSync('Contact your ServiceNow administrator for more information.');
    else if (error === 'no_score')
        return helpers.translateSync('Contact your ServiceNow administrator to collect scores for this KPI.');
    else if (error === 'invalid_kpi')
        return helpers.translateSync('KPI could not be found.');
    else
        return helpers.translateSync('Please try again later.');
}
