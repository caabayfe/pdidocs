/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { navigateTo, getBreadcrumbNavPayload } = imports["sn_oe_sfs.CiNavigationUtils"]();
    const navPayload = getBreadcrumbNavPayload(api, event);
    navigateTo(api, navPayload);
}
