/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.filterFeatureVal.length == 0 && api.state.filterProviderVal.length == 0 && api.state.filterStateVal.length == 0 && api.state.filterTypeVal.length == 0 && api.state.searchTerm == "") {
        return 'ALL';
    } else {
        return 'Search Result';
    }
}
