/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let activityForm = {...api.state.activityForm};
    activityForm.fields.attachedTableConfiguration.selectedValue = event.payload.item.id;
    activityForm.fields.attachedTableConfiguration.inputValue = event.payload.item.label;
    activityForm.fields.groupedActivityName.value = `${event.payload.item.label} attached`;
    api.setState('activityForm', activityForm);
}
