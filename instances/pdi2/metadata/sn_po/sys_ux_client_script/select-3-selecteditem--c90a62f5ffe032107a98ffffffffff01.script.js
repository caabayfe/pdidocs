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
    return selectedPlaybookDefinitionItems.length > 0 ?
        selectedPlaybookDefinitionItems[0].id : null;
}
