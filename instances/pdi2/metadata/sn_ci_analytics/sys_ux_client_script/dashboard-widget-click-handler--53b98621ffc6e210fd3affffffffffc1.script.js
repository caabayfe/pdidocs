/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        payload = {}
    } = event;
    const {
        params: {
            dataSourceType,
            indicatorSysid,
            table
        } = {}
    } = payload;
    if (dataSourceType === 'indicator' && indicatorSysid) {
        const external = {
            "url": `/now/platform-analytics-workspace/ac_kpi_details/${indicatorSysid}`
        };
        helpers.navigate.to(undefined, undefined, undefined, undefined, undefined, undefined, external);
    }
}
