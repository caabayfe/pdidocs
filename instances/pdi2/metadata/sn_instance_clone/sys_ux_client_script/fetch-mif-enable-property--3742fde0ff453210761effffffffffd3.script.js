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
    const homePageUtil = imports["sn_instance_clone.AdminCloneHomePageUiUtil"](api, helpers);
    homePageUtil.callUtilAPI({
        operation: "IS_MIF_ENABLED",
    }, true);
}
