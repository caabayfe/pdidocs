/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // advancedFilterQuery : The state variable that holds all the interactions on the list and as well as any query params being returned on page load ( captured on onload of the page )
    return api?.state?.advancedFilterQuery || "";
}
