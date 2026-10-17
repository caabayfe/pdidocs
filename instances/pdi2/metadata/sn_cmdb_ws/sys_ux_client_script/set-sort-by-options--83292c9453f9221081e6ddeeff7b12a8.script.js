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
    const {
        getSortByFieldOptions
    } = imports["sn_cmdb_ws.DataManagerCertificationDashboardUtil"](...arguments);
    api.setState('sortByOptions' , await getSortByFieldOptions());
}
