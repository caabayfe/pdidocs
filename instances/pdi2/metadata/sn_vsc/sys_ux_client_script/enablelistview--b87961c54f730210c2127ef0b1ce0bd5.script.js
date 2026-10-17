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
    var filterQuery = api?.context?.props?.filterQuery;
    /*
    Need to check that filterQuery is not "-1" since the 
    customer action single score widget in the configuration 
    overview page will pass in "-1" for the filterQuery parameter,
    which should not be treated as an actual query.
    */
    if (filterQuery && filterQuery != "-1") {
        api.setState("gridViewBtnStatus", "secondary");
        api.setState("listViewBtnStatus", "primary");
        api.setState("gridViewDisabled", true);
        api.setState("listViewDisabled", false);
    } else {
        api.setState("gridViewBtnStatus", "primary");
        api.setState("listViewBtnStatus", "secondary");
        api.setState("gridViewDisabled", false);
        api.setState("listViewDisabled", true);
    }
}
