/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */

function handler({api, event, helpers, imports}) {
    const mifUtil = imports["sn_instance_clone.CloneMIFUtil"](api, helpers);

    // Keep toggle in OFF position
    api.setState("isMifEnabled", false);

    // Mark all connected instances as "requested remove" (bulk remove trust)
    const currentInstances = api.state.trustorInstances || [];
    const updatedInstances = currentInstances.map(function(inst) {
        return Object.assign({}, inst, { status: 'requested remove' });
    });
    api.setState("trustorInstances", updatedInstances);

    mifUtil.callUtilAPI({
        operation: "TOGGLE_MIF_ENABLE",
        toggle: false
    }, true);

    helpers.modal.close("disable_mif");
}
