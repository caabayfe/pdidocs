/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let activityForm = {...api.state.activityForm};
    activityForm.fields.groupedActivityName.value = event.payload.value;
    api.setState('activityForm', activityForm);
}
