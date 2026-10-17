/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let dataFetchFailed = api.state.dataFetchFailed;
    if (dataFetchFailed)
        return helpers.translateSync("An error occurred. Please contact your System Administrator for more information.");
    else return helpers.translateSync("Create communication tasks to let users know about an ongoing major incident");
}
