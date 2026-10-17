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
        selectedEntity,
        activityForm,
        ACTIVITY_TYPES,
        RELATION_TYPES
    } = api.state;

    const excludedActivityTypes = [ACTIVITY_TYPES.CHILD_ATTACHED, ACTIVITY_TYPES.PARENT_ATTACHED];
    const excludedRelationTypes = [RELATION_TYPES.CHILD, RELATION_TYPES.REFERENCE];

    // AOI - not allowed
    if (activityForm.fields.hideActivity?.value) {
        // reset display order to default value 50
        return true;
    }
    // Child | Parent attached - not allowed
    if (excludedActivityTypes.includes(activityForm.fields.type.selectedValue)) {
        return true;
    }
    // single entity - allow always
    if (!selectedEntity.parent_entity?.value) {
        return false;
    }
    // MDM
    if (excludedRelationTypes.includes(selectedEntity.relation_type?.value)) {
        // default case
        if (activityForm.fields.type.selectedValue === ACTIVITY_TYPES.DEFAULT) {
            const {
                source_field,
                target_field
            } = selectedEntity;
            const referenceSelections = [source_field.value, target_field.value];
            return referenceSelections.includes(activityForm.fields.relation.selectedValue);
        }
        // non-default - allow always
        return false;
    }
    return true;
}
