/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //update filter query when conditions are updated in the condition builder
    const queryVal = event.payload.value;
    api.setState('groupFilterQuery',queryVal);
}
