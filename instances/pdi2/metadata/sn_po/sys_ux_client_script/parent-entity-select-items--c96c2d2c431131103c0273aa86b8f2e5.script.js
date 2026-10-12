/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const parentEntityListItems = [...api.state.entityForm.fields.parentEntity.listItems];
    const selectedEntity = {...api.state.selectedEntity};
    if (!selectedEntity._row_data) {
        return parentEntityListItems;
    }
    // Remove current entity from parent entity dropdown
    return parentEntityListItems.filter(item => item.id !== selectedEntity._row_data.uniqueValue);
}
