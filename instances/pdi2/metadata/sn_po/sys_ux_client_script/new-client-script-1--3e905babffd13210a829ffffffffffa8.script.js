/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 const activityForm = { ...api.state.activityForm };
 // Clear activity value for dot walk component to re-render
 activityForm.fields.relation.selectedValue = '';
 api.setState('activityForm', activityForm);
}
