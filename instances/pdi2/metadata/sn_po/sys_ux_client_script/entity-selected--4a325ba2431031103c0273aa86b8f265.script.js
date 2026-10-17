/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const entityForm = {...api.state.entityForm};
    entityForm.fields.entity.selectedValue = event.payload.item.id;
    entityForm.fields.entity.inputValue = event.payload.item.label;
    entityForm.fields.entity.tableName = event.payload.item.tableName;
    entityForm.fields.entity.invalid = false;
    entityForm.fields.relationField.selectedValue = null;
    
    api.setState('entityForm', entityForm);
    
    const selectedParentEntity = entityForm.fields.parentEntity.selectedValue;
    const selectedRelationType = entityForm.fields.relationType.selectedValue;
    
    if (selectedParentEntity && selectedRelationType && event.payload.value) {
        api.data.get_tables_reference_fields.execute({
            currentEntityTable: entityForm.fields.entity.tableName,
            referenceEntityTable: entityForm.fields.parentEntity.tableName,
            relationType: entityForm.fields.relationType.selectedValue,
            parentEntitySource: entityForm.fields.parentEntity.sourceType,
            childEntitySource: entityForm.fields.sourceType.selectedValue,
        });
    }
}
