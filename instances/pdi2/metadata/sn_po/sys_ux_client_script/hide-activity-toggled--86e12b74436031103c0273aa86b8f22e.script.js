/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let activityForm = {...api.state.activityForm};
    activityForm.fields.hideActivity.value = event.payload.value;
    if (event.payload.value) {
        activityForm.fields.activityValues.selectedValues = [];
        activityForm.fields.activityValues.selectedValuesLabels = [];
    }
    api.setState('activityForm', activityForm);
}
