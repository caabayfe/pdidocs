/**
* @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const perfHeaderUtils = imports['sn_sow_inc.SowPerfHeaderUtils']();
    let positiveMsgs = [];
    positiveMsgs.push(await helpers.translate('Great work!'));
    positiveMsgs.push(await helpers.translate('You are awesome!'));
    positiveMsgs.push(await helpers.translate('Keep up the good work!'));
    let kpiDetails;
    if(api.data.get_kpi_details_for_user.output && api.data.get_kpi_details_for_user.output.kpiTargets)
        kpiDetails = api.data.get_kpi_details_for_user.output.kpiTargets.kpiDetails;
    if(!kpiDetails)
        return;
    const rows = api.data.get_agent_kpi_scores.output.result.rows;
    const scores = perfHeaderUtils.getScoresForUser(rows, api.context.session.user.sys_id);
    const validPerfMetrics = perfHeaderUtils.getPerfMetricsExceedingTarget(kpiDetails, scores);
    let validPerfMetricsList = [];
    for (let x in validPerfMetrics)
        validPerfMetricsList.push(x);
    if (validPerfMetricsList.length === 0)
        return;
    let kpiChosen = validPerfMetricsList[Math.floor(Math.random() * validPerfMetricsList.length)];
    let perfMetricMsg;
    switch (kpiChosen) {
        case 'Quality':
            perfMetricMsg = await helpers.translate('Your quality score is at {0} this week.', validPerfMetrics['Quality']);
            break;
        case 'Average customer satisfaction':
            perfMetricMsg = await helpers.translate('Your customer satisfaction score is at {0} this week.', validPerfMetrics['Average customer satisfaction']);
            break;
        case 'First call resolution':
            perfMetricMsg = await helpers.translate('Your first call resolution is at {0} this week.', validPerfMetrics['First call resolution']);
            break;
        case 'Closed incidents':
            perfMetricMsg = await helpers.translate('You have closed {0} incidents in this week.', validPerfMetrics['Closed incidents']);
            break;
        case 'Average handle time':
            perfMetricMsg = await helpers.translate('Your average handle time is at {0} this week.', validPerfMetrics['Average handle time']);
     }
    if(!perfMetricMsg)
        return;
    let metricText = perfMetricMsg + ' ' + positiveMsgs[Math.floor(Math.random() * positiveMsgs.length)];
    api.setState('metricText', metricText);
}
