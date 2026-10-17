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
        child,
        parent
    } = api.state.breakdownLimit;
   
    if (!api.state.selectedEntity || !api.state.selectedEntity.table) {
        return true;
    }
    const existingBreakdownsCount = api.state.breakdownsCount;
    // Limit is 10 for primary entity, and 5 for rest
    const breakdownsLimit = api.state.selectedEntity.parent_entity.value ? child : parent;
    const selectedBreakdownFields = api.state.listSelectorSelectedItems;

    return Boolean(selectedBreakdownFields.length + existingBreakdownsCount <= breakdownsLimit);
}
