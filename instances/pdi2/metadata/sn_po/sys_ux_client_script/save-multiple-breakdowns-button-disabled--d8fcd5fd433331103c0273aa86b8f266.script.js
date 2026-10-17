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

    // Save button should be disabled if selected entity is not set
    if (!api.state.selectedEntity || !api.state.selectedEntity.table) {
        return true;
    }

    // Save button should be disabled if no items are selected
    const { listSelectorSelectedItems } = api.state;
    if (!listSelectorSelectedItems || listSelectorSelectedItems.length === 0) {
        return true;
    }

    const existingBreakdownsCount = api.state.breakdownsCount;
    // Limit is 10 for primary entity, and 5 for rest
    const breakdownsLimit = api.state.selectedEntity.parent_entity.value ? child : parent;
    const selectedBreakdownFields = api.state.listSelectorSelectedItems;

    return Boolean(selectedBreakdownFields.length + existingBreakdownsCount > breakdownsLimit);
}
