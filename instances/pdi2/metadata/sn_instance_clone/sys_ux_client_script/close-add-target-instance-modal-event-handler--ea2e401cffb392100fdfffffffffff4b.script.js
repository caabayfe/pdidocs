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
    api.setState("targetInstanceId", undefined);
    api.setState("showAddInstanceErrorMsg", false);
    helpers.modal.close("add_target_instance_modal");
}
