/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { DEFAULT, DATE_TIME } = api.state.ACTIVITY_TYPES;
    const { STRING, JOURNAL_INPUT } = api.state.INTERNAL_TYPES;
    const { EXTERNAL_DATA } = api.state.SOURCE_TYPES;
    const selectedEntity = { ...api.state.selectedEntity };

    const filteredActivityRecommendations = api.state.filteredActivityRecommendations.map(item => {
        return { ...item,
            selected: false
        };
    });
    api.setState('filteredActivityRecommendations', filteredActivityRecommendations);
    let activityForm = {...api.state.activityForm};
    if(api.state.selectedRecommendedActivity && api.state.selectedRecommendedActivity?.grouped){
        activityForm.fields.groupValues.value = 'separate-unique-values'
    }
    api.setState('selectedRecommendedActivity', []);
    activityForm.fields.relation.selectedValue = event.payload.field;
    const activityDefFieldValue = event.payload.field.split('.');
    if (activityDefFieldValue.length > 1) {
        api.setState('selectedActivityValues',[]);
        activityForm.fields.dotWalkInput.value = event.payload.field;
        activityForm.fields.name.value = event.payload.label;
    } else {
        activityForm.fields.dotWalkInput.value = '';
        activityForm.fields.name.value = '';
        activityForm.fields.dotWalkMode = false;
    }
    activityForm.fields.relation.label = event.payload.label;
    activityForm.fields.relation.internalType = event.payload.internalType;
    activityForm.fields.activityValues.selectedValues = [];
    activityForm.fields.activityValues.selectedValuesLabels = [];
    activityForm.fields.activityValuesChoice = 'ALL';
    if (activityForm.fields.type.selectedValue !== DATE_TIME) {
        activityForm.fields.groupValues.value = 'separate-unique-values';
    } else {
        activityForm.fields.groupValues.value = 'group-unique-values';
    }
    const translatedGroupActivityName = await helpers.translate('{0} changed', event.payload.label);
    activityForm.fields.groupedActivityName.value = translatedGroupActivityName;

    api.setState('activityForm', activityForm);
    api.setState('selectedActivityValues',[]);
    api.setState('includeActivityValues' , 'Include');

    let tableName = selectedEntity.table.value;
    let sourceType = selectedEntity.source_type.value;
    if (sourceType == 'ARCHIVED_DATA') {
        tableName = tableName.replace("ar_", "");
    }

    api.data.get_activity_field_details.execute({
        tableName: tableName,
        field: event.payload.field,
    });
}
