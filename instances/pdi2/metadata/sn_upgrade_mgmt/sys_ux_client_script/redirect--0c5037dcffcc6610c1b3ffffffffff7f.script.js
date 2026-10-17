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
    let url = "";

    const isATFavailable = api?.data?.is_atf_app_available_1?.output;
    var link = (isATFavailable) ? api.state.atfTestGeneratorAppLink1 : api.state.storeAppLink1;

    if (event.elementId === "button_10") url = "/now/sn_atf_tg/test_generator";
    else if (event.elementId === "button_1") url = link;
    else if (event.elementId === "button_9") url = "/sys_atf_test_list.do";
    else if (event.elementId === "button_2") url = "/sys_atf_test_suite_list.do";
    helpers.timing.setTimeout(function() {
        this.window.open(url);
    });
}
