/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let testSelectedTaskId = event.payload?.selectedRecords[0];
    api.setState('testSelectedCount',event.payload.selectionCount);
    api.setState('testSelectedTaskId',testSelectedTaskId)

}
