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
        parentEntity,
        targetField
    } = api.state.entityForm.fields;
    if (!parentEntity.selectedValue || !targetField.label)
        return;

    const entitiesData = [...api.state.entityCardRepeaterData];
    const parentEntityData = entitiesData.find(e => e.entityId === parentEntity.selectedValue);
    if (!parentEntityData)
      return;

    return helpers.translateSync('Creating a reference entity automatically adds a grouped activity definition for the "{0}" field to its parent entity.  Since the "{1}" entity has reached its limit of 5 activity definitions of type "Default", remove at least one activity definition to improve readability of the process graph.', targetField.label.split('(')[0], parentEntityData.table.label);
}
