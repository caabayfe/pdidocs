/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let url = "";
    if (event.elementId === "button_3") url = "/sys_atf_test_list.do";
    helpers.timing.setTimeout(function() {
        this.window.open(url);
    });
}
