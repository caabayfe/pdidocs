/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api,event,helpers,imports}) {
    //if no results, and not an ongoing search, disable search on empty set
    if (api.data.look_up_related_records && api.data.look_up_related_records.results &&
        !api.data.look_up_related_records.results[0] &&
        !api.state.selectedFilter.includes("^123TEXTQUERY321=")) {
            api.setState("searchDisabled", true);
            api.setState("searchString", "");
        }
}
