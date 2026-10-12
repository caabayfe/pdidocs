/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const sortedPayloadValue = event.payload.value.sort((a, b) => {
        return a.label.localeCompare(b.label);
    });

    let activityForm = {...api.state.activityForm};

    activityForm.fields.relation.selectedValue = sortedPayloadValue.map(item => item.id).join(',');
    activityForm.fields.relation.label = sortedPayloadValue.map(item => item.label).join(', ');
    activityForm.fields.relation.internalType = null;
    activityForm.fields.activityValues.selectedValues = [];
    activityForm.fields.activityValues.selectedValuesLabels = [];
    activityForm.fields.name.value = activityForm.fields.relation.label;
    activityForm.fields.groupedActivityName.value = `${activityForm.fields.relation.label} changed`;
    
    api.setState('activityForm', activityForm);
}
