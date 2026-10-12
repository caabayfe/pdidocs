/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.elementId == "grid_view_button_toggle") {
        api.setState("gridViewBtnStatus", "primary");
        api.setState("listViewBtnStatus", "secondary");
        api.setState("gridViewDisabled", false);
        api.setState("listViewDisabled", true);
    } else {
        api.setState("gridViewBtnStatus", "secondary");
        api.setState("listViewBtnStatus", "primary");
        api.setState("gridViewDisabled", true);
        api.setState("listViewDisabled", false);
    }
}
