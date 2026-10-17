/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const tableName = api.state.search.tableDisplayName;
    if (!api.state.ciSearchExpanded && tableName) {
        if (api.data.get_display_name_of_encodedquery.output &&
            api.data.get_display_name_of_encodedquery.output.result &&
            api.data.get_display_name_of_encodedquery.output.result.encodedQueryDisplayValue) {
            return {
                label: helpers.translateSync("Class = {0} > {1}", tableName, api.data.get_display_name_of_encodedquery.output.result.encodedQueryDisplayValue)
            };
        } else {
            return {
                label: helpers.translateSync("Class = {0}", tableName)
            };
        }
    }
}
