/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    function navigateToQueriesPage(selectedTabIndex) {
        helpers.navigate.to("queries", null, {
            "selectedTabIndex": selectedTabIndex
        });
    }

    if (event.elementId == "evaluate_access_list")
        navigateToQueriesPage(0);
    else if (event.elementId == "access_comparison_list")
        navigateToQueriesPage(1);
}
