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
    const mifUtil = imports["sn_instance_clone.CloneMIFUtil"](api, helpers);
    var toggle = event.payload.value;
    api.setState('stepContainer', 0);
    if (!toggle) {
        helpers.modal.open('disable_mif');
    } else {
        api.setState("isMifEnabled", toggle);
        mifUtil.callUtilAPI({
            operation: "TOGGLE_MIF_ENABLE",
            toggle: toggle
        }, true);
    }
}
