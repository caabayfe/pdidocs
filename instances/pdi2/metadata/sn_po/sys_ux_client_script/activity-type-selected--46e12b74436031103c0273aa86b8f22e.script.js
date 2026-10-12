/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        ACTIVITY_TYPES: { DATE_TIME, PARENT_ATTACHED, CHILD_ATTACHED, COMPOUND },
        SOURCE_TYPES,
        selectedEntity
    } = api.state;

    let activityForm = { ...api.state.activityForm
    };
    activityForm.fields.type.selectedValue = event.payload.item.id;
    activityForm.fields.relation.selectedValue = null;
    activityForm.fields.dotWalkInput.value = '';
    activityForm.fields.dotWalkMode = false;
    activityForm.fields.attachedTableConfiguration.disabled = false;
    activityForm.fields.attachedTableConfiguration.selectedValue = null;
    activityForm.fields.attachedTableConfiguration.inputValue = '';
    activityForm.fields.attachedTableConfiguration.listItems = [];
    activityForm.fields.groupedActivityName.value = '';
    activityForm.fields.groupValues.value = 'separate-unique-values';
    activityForm.fields.groupValues.disabled = false;

    if(selectedEntity?.source_type?.value === SOURCE_TYPES.AGENTIC_AI_DATA) {
        activityForm.fields.includeEmptyStartNode.value = false;
    }

    if (event.payload.item.id === DATE_TIME) {
        activityForm.fields.groupValues.value = 'group-unique-values';
        activityForm.fields.groupValues.disabled = true;
        activityForm.fields.hideActivity.value = false;
        activityForm.fields.includeEmptyStartNode.value = false;
        activityForm.fields.name.value = '';
        activityForm.fields.activityValues.selectedValues = [];
        activityForm.fields.activityValues.selectedValuesLabels = [];
    } else if (event.payload.item.id === PARENT_ATTACHED) {
        activityForm.fields.groupValues.value = 'group-unique-values';
        activityForm.fields.groupValues.disabled = true;
        activityForm.fields.hideActivity.value = false;
        activityForm.fields.includeEmptyStartNode.value = false;
        activityForm.fields.name.value = '';
        activityForm.fields.activityValues.selectedValues = [];
        activityForm.fields.activityValues.selectedValuesLabels = [];
        activityForm.fields.groupedActivityName.value = `${api.state.selectedEntity.parent_entity.displayValue} attached`;
        activityForm.fields.attachedTableConfiguration.disabled = true;
        activityForm.fields.attachedTableConfiguration.inputValue = api.state.selectedEntity.parent_entity.displayValue;
        activityForm.fields.attachedTableConfiguration.selectedValue = api.state.selectedEntity.parent_entity.value;
    } else if (event.payload.item.id === CHILD_ATTACHED) {
        activityForm.fields.groupValues.value = 'group-unique-values';
        activityForm.fields.groupValues.disabled = true;
        activityForm.fields.hideActivity.value = false;
        activityForm.fields.includeEmptyStartNode.value = false;
        activityForm.fields.name.value = '';
        activityForm.fields.activityValues.selectedValues = [];
        activityForm.fields.activityValues.selectedValuesLabels = [];
        activityForm.fields.attachedTableConfiguration.listItems = api.state.allEntities.filter((entity) => {
            return entity.parent_entity.value === api.state.selectedEntity._row_data.uniqueValue && entity.relation_type.value === 'CHILD';
        }).map((entity) => {
            return {
                id: entity._row_data.uniqueValue,
                label: entity._row_data.displayValue,
            };
        });
    } else if (event.payload.item.id === COMPOUND) {
        activityForm.fields.groupValues.value = 'group-unique-values';
        activityForm.fields.groupValues.disabled = true;
        activityForm.fields.hideActivity.value = false;
        activityForm.fields.includeEmptyStartNode.value = false;
        activityForm.fields.name.value = '';
        activityForm.fields.activityValues.selectedValues = [];
        activityForm.fields.activityValues.selectedValuesLabels = [];
        activityForm.fields.groupedActivityName.value = '';
    }
    
    api.setState('activityForm', activityForm);
}
