/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let activityForm = {...api.state.activityForm};
    activityForm.fields.dotWalkMode = event.payload.value;
    if (event.payload.value) {
        activityForm.fields.dotWalkInput.value = '';
    } else {
        activityForm.fields.relation.selectedValue = null;
    }
    activityForm.fields.name.value = '';
    api.setState('activityForm', activityForm);
}
