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
    const fields = {
        globalSearchViewConfigId: api.context.props.globalSearchViewConfigId
    };
    const params = {
        searchTerm: event.payload.searchTerm,
    };
    if (event.name === 'SN_SEARCH_RESULTS_CONTAINER#SEARCH_EXECUTED') {
        params.disableSpellCheck = true;
    } else if (event.name === 'SN_SEARCH_COMBOBOX#SEARCH_EXECUTED') {
        params.disableSpellCheck = false;
    }
    if (event.payload.searchTerm !== "") {
        helpers.navigate.to('kc-zing-search', fields, params, false, false);
    }
}
