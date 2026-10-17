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
        resetPaginationIndexes
    } = imports["sn_cmdb_ws.DataManagerCertificationDashboardUtil"](...arguments);
    const {
        fieldValue: searchTerm
    } = event.payload;
    api.setState('filters', ({
        currentValue
    }) => {
        return {
            ...currentValue,
            ['cmdb_policy_name']: searchTerm
        };
    });
    resetPaginationIndexes();
}
