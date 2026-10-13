/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let heading = {};
    let dataFetchFailed = api.state.dataFetchFailed;
    if (dataFetchFailed)
        heading.label = helpers.translateSync("No results found");
    else
        heading.label = helpers.translateSync("No communication tasks");
    heading.level = "3";
    return heading;
}
