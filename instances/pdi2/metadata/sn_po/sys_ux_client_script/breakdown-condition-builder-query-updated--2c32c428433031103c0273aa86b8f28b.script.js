/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let breakdownForm = { ...api.state.breakdownForm };
    breakdownForm.fields.filter.value = event.payload.value;
    breakdownForm.fields.filter.partial = event.payload.partial;
    api.setState('breakdownForm', breakdownForm);
}
