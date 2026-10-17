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
    if (event.payload.searchTerm != "") {
        var isAISearchEnabled = api.data.check_ai_search_satus_1.output;
        if (isAISearchEnabled) {
            const fields = {
                searchContextConfigId: event.payload.searchContextConfigId
            };
            const params = {
                searchTerm: event.payload.searchTerm
            };
            helpers.navigate.to('search-results', fields, params, false, false);

        } else {
            const {
                SEARCH_CONSTANTS
            } = imports["sn_km_center.searchInputUtils"]();
            const fields = {
                globalSearchViewConfigId: SEARCH_CONSTANTS.GLOBAL_SEARCH_VIEW_CONFIG_ID
            };
            const params = {
                searchTerm: event.payload.searchTerm,
                selectedSearchContext: 'now/knowledge-center'
            };
            helpers.navigate.to('kc-zing-search', fields, params, false, false);

        }
    }
}
