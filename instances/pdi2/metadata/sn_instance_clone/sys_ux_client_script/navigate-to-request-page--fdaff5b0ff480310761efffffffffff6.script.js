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
        navigateToPage
    } = imports['sn_instance_clone.InstanceCloneUtils']();

    navigateToPage(api, "clone-request", {
        'sysId': -1
    });

}
