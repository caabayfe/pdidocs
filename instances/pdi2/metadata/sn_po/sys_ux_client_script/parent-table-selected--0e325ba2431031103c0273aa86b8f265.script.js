/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { EXTERNAL_DATA } = api.state.SOURCE_TYPES;
    const entityForm = {...api.state.entityForm};
    entityForm.fields.parentEntity.selectedValue = event.payload.value;
    entityForm.fields.parentEntity.tableName = event.payload.item.tableName;
    entityForm.fields.parentEntity.sourceType = event.payload.item.sourceType;
    entityForm.fields.parentEntity.invalid = false;
    entityForm.fields.relationField.selectedValue = null;
    api.setState('entityForm', entityForm);

    const selectedEntity = entityForm.fields.entity.selectedValue;
    const selectedRelationType = entityForm.fields.relationType.selectedValue;

    if (entityForm.fields.parentEntity.sourceType === EXTERNAL_DATA && entityForm.fields.sourceType.selectedValue === EXTERNAL_DATA) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'mdm-error',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: await helpers.translate('MDM relationship between external data tables is not supported'),
                action: {
                    type: 'dismiss'
                },
            }],
        });
        return;
    }

    if (selectedEntity && selectedRelationType && event.payload.value) {
        api.data.get_tables_reference_fields.execute({
            currentEntityTable: entityForm.fields.entity.tableName,
            referenceEntityTable: entityForm.fields.parentEntity.tableName,
            relationType: entityForm.fields.relationType.selectedValue,
            parentEntitySource: entityForm.fields.parentEntity.sourceType,
            childEntitySource: entityForm.fields.sourceType.selectedValue,
        });
    }
}
