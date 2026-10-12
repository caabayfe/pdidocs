/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return '<p>' + helpers.translateSync("The scan is being executed. You may leave this page or review the progress. Note: If a record is inactive, the checks don't generate any findings for that record.") + '</p>';
}
