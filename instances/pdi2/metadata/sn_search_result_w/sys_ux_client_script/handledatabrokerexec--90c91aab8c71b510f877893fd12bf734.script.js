/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var stateUpdated = imports['sn_search_result_w.AISearchResultWrapperUtil']().formatFilterProps(api);

    if(!stateUpdated && api.data.check_if_global_search_is_aisearch.properties.booleanValue){
        api.data.searchcompositedatabroker_1.refresh();
    }
}
