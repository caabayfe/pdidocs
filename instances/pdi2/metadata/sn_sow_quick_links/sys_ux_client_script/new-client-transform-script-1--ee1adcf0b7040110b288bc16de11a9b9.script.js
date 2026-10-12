/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.fetchedRecordCount == 0 || api.state.editMode || api.state.addNewLink;
}
