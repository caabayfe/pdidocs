/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var hideButtons = true;
    var hideAlert = true;
    if(api.data.show_load_buttons && api.data.show_load_buttons.output) {
        if(api.data.show_load_buttons.output.showLoadButtons) {
            hideButtons = false;
            hideAlert = false;
        }
    }
    api.setState('hideLoadButtons',hideButtons);
    api.setState('hideInfoAlert',hideAlert);
}
