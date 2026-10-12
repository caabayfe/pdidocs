/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var stats = api.state.primaryStorageStats;
    var collectionDate = stats.collectionDate;

    if (collectionDate) {
        var formattedDate = collectionDate.split(" ");
        if (formattedDate.length > 0) {
            formattedDate.pop();
            formattedDate = formattedDate.join(' ');
            return helpers.translateSync("Last refreshed by") + " " + formattedDate;
        }
    }
    return "";
}
