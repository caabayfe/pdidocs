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
    const activityDetails = api.data.look_up_activity_details.result;

    const {
        DATE_TIME,
        COMPOUND
    } = api.state.ACTIVITY_TYPES;
    let activityForm = { ...api.state.activityForm };
    const sourceType = api.state.selectedEntity.source_type.value;
    let selectedValues = [];
    let selectedValuesLabels = [];

    if (activityDetails.field_values.value && activityDetails.field_display_values.value) {
        const fieldValuesList = activityDetails.field_values.value.split(',');
        const fieldDisplayValuesList = activityDetails.field_display_values.value.split(',');
        if (fieldValuesList.length === fieldDisplayValuesList.length) {
            for (let i = 0; i < fieldValuesList.length; i += 1) {
                selectedValues[i] = {
                    id: fieldValuesList[i],
                    label: fieldDisplayValuesList[i]
                };
                selectedValuesLabels[i] = fieldDisplayValuesList[i];
            }
        }
    }
    let attachedConfigListItems = [];
    if (activityDetails.type.value === api.state.ACTIVITY_TYPES.CHILD_ATTACHED) {
        attachedConfigListItems = api.state.allEntities.filter((entity) => {
            return entity.parent_entity.value === api.state.selectedEntity._row_data.uniqueValue && entity.relation_type.value === 'CHILD';
        }).map((entity) => {
            return {
                id: entity._row_data.uniqueValue,
                label: entity._row_data.displayValue,
            };
        });
    }
    const fetchedActivityForm = {
        fields: {
            groupValues: {
                value: activityDetails.track_change.value ? 'group-unique-values' : 'separate-unique-values',
                disabled: (activityDetails.type.value === DATE_TIME || activityDetails.type.value === COMPOUND) ? true : false,
            },
            hideActivity: {
                value: activityDetails.activity_of_interest.value,
            },
            name: {
                invalid: false,
                value: activityDetails.display_name.value,
            },
            displayOrder: {
                value: activityDetails.display_order.value,
                invalid: false,
            },
            relation: {
                invalid: false,
                listItems: sourceType === api.state.SOURCE_TYPES.AGENTIC_AI_DATA ? api.state.aaiTaskChoices : activityForm.fields.relation.listItems,
                selectedValue: activityDetails.field.value,
                label: activityDetails.field.displayValue,
                internalType: null,
            },
            type: {
                invalid: false,
                listItems: activityForm.fields.type.listItems,
                selectedValue: activityDetails.type.value,
            },
            activityValues: {
                selectedValues: selectedValues,
                selectedValuesLabels: selectedValuesLabels,
            },
            groupedActivityName: {
                value: activityDetails.change_name.value,
                invalid: false,
            },
            attachedTableConfiguration: {
                selectedValue: activityDetails.attached_entity.value,
                listItems: attachedConfigListItems,
                inputValue: activityDetails.attached_entity.displayValue,
                invalid: false,
                disabled: Boolean(activityDetails.type.value === api.state.ACTIVITY_TYPES.PARENT_ATTACHED),
            },
            includeEmptyStartNode: {
                value: activityDetails.include_empty_start_node.value,
            },
            dotWalkMode: activityDetails.field.value?.includes('.') || false,
            dotWalkInput: {
                value: activityDetails.field.value,
                invalid: false,
            },
            activityValuesChoice: activityDetails.field_values_selection_type.value == null ? "ALL" : activityDetails.field_values_selection_type.value,
        },
    };
    api.setState('activityValues', []);
    api.setState('selectedActivityFieldDetails', {});
    api.setState('activityForm', fetchedActivityForm);

    // Fetch table name of the selected field if it is dotwalked field.
    // This is not required for regular fields since root table is known
    // from selectedEntity state variable.

    let tableName = api.state.selectedEntity.table.value;
    let field = activityDetails.field.value;
    if (sourceType == api.state.SOURCE_TYPES.ARCHIVED_DATA) {
        tableName = tableName.replace("ar_", "");
    } else if(sourceType === api.state.SOURCE_TYPES.AGENTIC_AI_DATA) {
        tableName = api.state.AGENTIC_API_TABLES.TASK;
        field = 'type';
    }
    if (field?.includes('.')) {
        api.data.get_dotwalk_field_table.execute({
            rootTable: tableName,
            field
        });
    } else {
        api.data.get_activity_field_details.execute({
            tableName: tableName,
            field
        });
    }

    let currentView = { ...api.state.currentView };
    currentView = {
        view: api.state.VIEWS.ACTIVITY_FORM,
        params: {
            mode: 'EDIT',
        },
    };
    api.setState('currentView', currentView);
}
