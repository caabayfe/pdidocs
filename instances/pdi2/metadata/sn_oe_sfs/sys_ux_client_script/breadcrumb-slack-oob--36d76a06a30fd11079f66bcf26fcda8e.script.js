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
    const { navigateFromBreadcrumb } = imports["sn_oe_sfs.CiNavigationUtils"]();
    navigateFromBreadcrumb(api, event);
}
