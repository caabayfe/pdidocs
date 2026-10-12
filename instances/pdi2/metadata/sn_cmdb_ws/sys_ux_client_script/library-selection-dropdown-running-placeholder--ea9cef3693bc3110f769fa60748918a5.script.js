/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var libraryList = api.data.deduplication_template_get_all_libraries.output.result;
    //list will always have 'All' Option available
    if (libraryList.length > 0) {
        return libraryList[0].label;
    } else {
        return '';
    }
}
