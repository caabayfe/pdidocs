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
    var toggle = event.payload.value;

    if(!toggle) {
        helpers.modal.open('mif_disable_confirmation_popup');
    }
    else {
    var multiInstanceView = JSON.parse(JSON.stringify(api.state.multiInstanceView));
    multiInstanceView.isMifEnabled = toggle;
    api.setState("multiInstanceView", multiInstanceView);

    homePageUtil.callUtilAPI({
        operation: "TOGGLE_MIF_ENABLE",
        toggle: toggle
    }, true);
    }
}
