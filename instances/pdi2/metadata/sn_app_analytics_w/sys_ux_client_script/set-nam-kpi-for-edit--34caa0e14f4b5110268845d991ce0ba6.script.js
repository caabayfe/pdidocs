/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const selectedRecords = event.payload.selectedRecords;
    api.setState('selectedKPIsForEdit', selectedRecords);
}
