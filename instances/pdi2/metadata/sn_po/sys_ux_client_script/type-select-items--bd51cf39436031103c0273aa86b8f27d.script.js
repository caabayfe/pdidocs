/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let listItems = [...api.state.activityForm.fields.type.listItems];
    if (!api.state.selectedEntity._row_data) {
        return listItems;
    }
    const childrenFound = api.state.allEntities.some((entity) => {
        return (
            entity.parent_entity.value === api.state.selectedEntity._row_data.uniqueValue &&
            entity.relation_type.value === 'CHILD'
        );
    });

    if (!childrenFound) {
        // Remove child attached option
        listItems = listItems.filter((item) => item.id !== api.state.ACTIVITY_TYPES.CHILD_ATTACHED);
    }

    let removeParentAttachedOption = false;
    if (!api.state.selectedEntity.parent_entity.value || api.state.selectedEntity.relation_type.value !== 'REFERENCE') {
        removeParentAttachedOption = true;
    }

    if (removeParentAttachedOption) {
        // Remove child attached option
        listItems = listItems.filter((item) => item.id !== api.state.ACTIVITY_TYPES.PARENT_ATTACHED);
    }
    // Do not allow DATE_TIME activities for AGENTIC_AI_DATA
    if (api.state.selectedEntity?.source_type?.value == api.state.SOURCE_TYPES.AGENTIC_AI_DATA) {
        listItems = listItems.filter((item) => item.id !== api.state.ACTIVITY_TYPES.DATE_TIME);
    }
    return listItems;
}
