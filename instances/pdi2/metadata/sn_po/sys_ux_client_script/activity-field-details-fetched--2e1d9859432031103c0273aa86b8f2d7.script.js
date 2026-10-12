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
    const fieldDetails = event.payload.data.output.data.snPo.GlidePromin.prominGetActivityFieldDetails.fieldDetails;
    const activityForm = { ...api.state.activityForm };
    const { DEFAULT } = api.state.ACTIVITY_TYPES;
    const { STRING, JOURNAL_INPUT, GLIDE_DATE_TIME } = api.state.INTERNAL_TYPES;
    const { EXTERNAL_DATA, ARCHIVED_DATA } = api.state.SOURCE_TYPES;
    const selectedEntity = { ...api.state.selectedEntity };
    const sourceIsAgenticAI = api.state.selectedEntity?.source_type?.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA;

    api.setState('selectedActivityFieldDetails', fieldDetails);
    if (fieldDetails && fieldDetails.referenceTable) {
        api.setState('fieldSelectValuesReferenceTable', fieldDetails.referenceTable);
        api.data.get_reference_table_items.execute({
            table: getOriginalTableName(fieldDetails.referenceTable),
            searchTerm: ''
        });
    } else if (fieldDetails && fieldDetails.internalType == 'choice') {
        if (activityForm.fields.dotWalkMode) {
            const dotWalkInputParts = activityForm.fields.dotWalkInput.value.split('.');
            api.data.get_ad_field_value_choices.execute({
                table: getOriginalTableName(activityForm.fields.dotWalkInput.table),
                column: dotWalkInputParts[dotWalkInputParts.length-1],
            });
        } else {
            const table = sourceIsAgenticAI ? api.state.AGENTIC_API_TABLES.TASK: getOriginalTableName(selectedEntity.table.value);
            const column = sourceIsAgenticAI ? 'type' : activityForm.fields.relation.selectedValue;
            api.data.get_ad_field_value_choices.execute({
                table,
                column
            });
        }
    }

    // String and journal fields need to be grouped ADs, but not for fields from external data tables.
    if (selectedEntity.source_type.value !== EXTERNAL_DATA && (selectedEntity.source_type.value !== ARCHIVED_DATA || (fieldDetails.internalType === STRING || fieldDetails.internalType === JOURNAL_INPUT)) && activityForm.fields.type.selectedValue === DEFAULT && (fieldDetails.internalType === STRING || fieldDetails.internalType === JOURNAL_INPUT)) {
        activityForm.fields.groupValues.value = 'group-unique-values';
        activityForm.fields.groupedActivityName.value = activityForm.fields.groupedActivityName.value
            ? activityForm.fields.groupedActivityName.value
            : await helpers.translate('{0} changed', activityForm.fields.relation.label);
        activityForm.fields.groupValues.disabled = true;
    } else if (activityForm.fields.type.selectedValue === DEFAULT && !api.state.selectedRecommendedActivity?.grouped && activityForm.fields.groupValues.value !== 'group-unique-values') {
        activityForm.fields.groupValues.disabled = false;
        activityForm.fields.groupValues.value =  'separate-unique-values';
    } else if (fieldDetails.internalType === GLIDE_DATE_TIME) {
        // For date time fields, activity should always be grouped and toggle should be disabled
        activityForm.fields.groupValues.disabled = true;
        activityForm.fields.groupValues.value = 'group-unique-values';
    }

    api.setState('activityForm', activityForm);

    function getOriginalTableName(table) {
        return table.startsWith('ar_') ? table.slice(3) : table;
    }
}
