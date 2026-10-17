/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("clearListSelection", null);
    api.setState('selectedRecords', event.payload.selectedRecords);
    api.setState('exceptedRecords', event.payload.exceptedRecords);
    if(event.payload.selectedRecords.length > 0) {
        api.setState('isRunTestsDisabled', false);
    } else {
        api.setState('isRunTestsDisabled', true);
    }
}
