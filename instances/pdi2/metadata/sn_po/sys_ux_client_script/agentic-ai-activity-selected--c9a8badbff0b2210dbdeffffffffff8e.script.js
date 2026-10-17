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
    debugger;
    const {
        DEFAULT,
        DATE_TIME
    } = api.state.ACTIVITY_TYPES;
    const {
        STRING,
        JOURNAL_INPUT
    } = api.state.INTERNAL_TYPES;
    const selectedEntity = { 
        ...api.state.selectedEntity
    };

    const {
        id: field,
        label: fieldLabel
    } = event.payload.item;

    let activityForm = { 
        ...api.state.activityForm
    };
    activityForm.fields.relation.selectedValue = field;
    activityForm.fields.dotWalkInput.value = '';
    activityForm.fields.name.value = fieldLabel;
    activityForm.fields.dotWalkMode = false;
    activityForm.fields.relation.label = fieldLabel;
    activityForm.fields.relation.internalType = 'choice';
    activityForm.fields.activityValues.selectedValues = [];
    activityForm.fields.activityValues.selectedValuesLabels = [];
    activityForm.fields.activityValuesChoice = 'ALL';
    activityForm.fields.groupValues.value = 'separate-unique-values';
    const translatedGroupActivityName = await helpers.translate('{0} changed', fieldLabel);
    activityForm.fields.groupedActivityName.value = translatedGroupActivityName;

    api.setState('activityForm', activityForm);
    api.setState('selectedActivityValues', []);
    api.setState('includeActivityValues', 'Include');

    api.data.get_activity_field_details.execute({
        tableName: api.state.AGENTIC_API_TABLES.TASK,
        field: 'type',
    });
}
