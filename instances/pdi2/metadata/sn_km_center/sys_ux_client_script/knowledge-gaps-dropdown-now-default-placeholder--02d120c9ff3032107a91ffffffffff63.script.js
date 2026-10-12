/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var items = (api.state.gapTaskTypeData || [])
        .filter(item => item.canRead && item.isGenAIPluginActive);

    var selectedItems = items.filter(item => item.id === api.state.gapTaskType);
    if (selectedItems.length) {
        return selectedItems[0].label;
    }

    var itemsWithGaps = items.filter(item => item.isSkillActive && item.gapSize > 0);
    if (itemsWithGaps.length) {
        return itemsWithGaps[0].label;
    }

    return items.length ? items[0].label : '';
}
