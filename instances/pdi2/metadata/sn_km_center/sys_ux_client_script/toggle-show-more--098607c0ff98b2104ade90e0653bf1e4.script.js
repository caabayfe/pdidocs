/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {state: { showMore, results } } = api;
    
    const utils = imports["sn_km_center.ArticleAssistUIUtils"](api, helpers);
    let selectedScan = null;
    if (event.elementId == "show_more_button") {
        selectedScan = event.context.item;
    }

    utils.toggleShowMore(showMore, results, selectedScan);

}
