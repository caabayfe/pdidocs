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
        handlePageNavigation
    } = imports["sn_km_center.searchInputUtils"]();
    handlePageNavigation(helpers, 'knowledge-hub');
}
