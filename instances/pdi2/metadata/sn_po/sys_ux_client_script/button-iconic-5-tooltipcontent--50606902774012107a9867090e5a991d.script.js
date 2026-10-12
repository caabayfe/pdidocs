/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.selectedConfigListItems.length > 0 ?
        helpers.translateSync('Delete selected') :
        helpers.translateSync('No items selected for deletion');
}
