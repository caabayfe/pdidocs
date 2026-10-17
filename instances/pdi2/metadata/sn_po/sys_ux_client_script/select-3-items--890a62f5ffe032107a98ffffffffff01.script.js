/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        selectedPlaybookDefinitionItems
    } = api.state;
    if (selectedPlaybookDefinitionItems.length > 0) {
        return selectedPlaybookDefinitionItems;
    }
    return [];
}
