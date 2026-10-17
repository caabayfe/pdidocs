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
    var elementId = event.elementId;
    switch (elementId) {
        case "no_button":
            helpers.modal.close("mif_disable_confirmation_popup");
            break;
        case "yes_button":
            const homePageUtil = imports["sn_instance_clone.AdminCloneHomePageUiUtil"](api, helpers);
            var toggle = false;
            var multiInstanceView = JSON.parse(JSON.stringify(api.state.multiInstanceView));
            multiInstanceView.isMifEnabled = toggle;
            api.setState("multiInstanceView", multiInstanceView);

            homePageUtil.callUtilAPI({
                operation: "TOGGLE_MIF_ENABLE",
                toggle: toggle
            }, true);
            helpers.modal.close("mif_disable_confirmation_popup");
            break;
    }

}
