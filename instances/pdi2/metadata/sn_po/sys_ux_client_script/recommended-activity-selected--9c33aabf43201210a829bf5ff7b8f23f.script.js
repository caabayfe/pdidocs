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
    const {
        DEFAULT,
        DATE_TIME
    } = api.state.ACTIVITY_TYPES;
    const {
        STRING,
        JOURNAL_INPUT
    } = api.state.INTERNAL_TYPES;
    const {
        EXTERNAL_DATA
    } = api.state.SOURCE_TYPES;
    const selectedEntity = { ...api.state.selectedEntity
    };

    let activityForm = { ...api.state.activityForm
    };
    activityForm.fields.relation.selectedValue = api.state.selectedRecommendedActivity.fieldName;
    const activityDefFieldValue = api.state.selectedRecommendedActivity.fieldName.split('.');
    if (activityDefFieldValue.length > 1) {
        activityForm.fields.dotWalkInput.value = api.state.selectedRecommendedActivity.fieldName;
        activityForm.fields.name.value = api.state.selectedRecommendedActivity.label;
    } else {
        activityForm.fields.dotWalkInput.value = '';
        activityForm.fields.name.value = '';
        activityForm.fields.dotWalkMode = false;
    }
    activityForm.fields.relation.label = api.state.selectedRecommendedActivity.label;
    activityForm.fields.relation.internalType = '';
    activityForm.fields.activityValues.selectedValues = [];
    activityForm.fields.activityValues.selectedValuesLabels = [];
    activityForm.fields.activityValuesChoice = 'ALL';
    activityForm.fields.type.selectedValue = api.state.ACTIVITY_TYPES.DEFAULT;
    const translatedGroupActivityName = await helpers.translate('{0} changed', api.state.selectedRecommendedActivity.label);
    const val = api.state.selectedRecommendedActivity.grouped == true ? 'group-unique-values' : 'separate-unique-values';
    activityForm.fields.groupValues.value = val;
    activityForm.fields.groupedActivityName.value = translatedGroupActivityName;

    api.setState('activityForm', activityForm);
    api.setState('selectedActivityValues', []);
    api.setState('includeActivityValues', 'Include');

    let tableName = selectedEntity.table.value;
    let sourceType = selectedEntity.source_type.value;
    if (sourceType == 'ARCHIVED_DATA') {
        tableName = tableName.replace("ar_", "");
    }

    api.data.get_activity_field_details.execute({
        tableName: tableName,
        field: api.state.selectedRecommendedActivity.fieldName,
    });
    helpers.modal.close("[component-id$='activity_recommendations_modal']");
}
