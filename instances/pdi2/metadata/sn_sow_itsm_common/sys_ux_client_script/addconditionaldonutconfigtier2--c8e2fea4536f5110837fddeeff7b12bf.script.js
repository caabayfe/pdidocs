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
    var conditionalRecordCount = 0;
    if (event.name === 'DATA_FETCH_SUCCEEDED') {
        conditionalRecordCount = api.data.fetch_conditional_donut_record_count.output.data.GlideRecord_Query[api.state.conditionalVizConfig.tableName]['_rowCount'];
        api.setState("conditionalRecordCount", conditionalRecordCount);
        if (conditionalRecordCount > 0) {
            const landingPageUtils = imports['sn_sow_itsm_common.SOWLandingPageTier2Utils']();
            const donutConfig = await landingPageUtils.getDonutConfig(helpers, 'your_work', conditionalRecordCount,api);
            api.setState("donutConfig", donutConfig);
        }
    }
}
