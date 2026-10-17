/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var opts = api.context.props.options || {};
    var result = Object.assign({}, opts);

    var domainPath = api.state.selected_domain_path;
    if (domainPath && domainPath !== "all")
        result.domainPath = domainPath;

    var filterQuery = api.state.filterEncodedQuery;
    if (filterQuery)
        result.filterEncodedQuery = filterQuery;

    api.setState("aiOptions", result);
}
