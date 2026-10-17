/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("clearAvailableSuite", null);
    api.setState('aSelectedRecords', event.payload.selectedRecords);
    api.setState('aExceptedRecords', event.payload.exceptedRecords);
    if(event.payload.selectionCount != 0) {
        api.setState('isMoveDisabled', false);
    } else {
        api.setState('isMoveDisabled', true);
    }
}
