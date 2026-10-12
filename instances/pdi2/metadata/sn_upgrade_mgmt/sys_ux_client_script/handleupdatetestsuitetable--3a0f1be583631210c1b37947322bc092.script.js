/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("clearUpgradeSuite", null);
    api.setState("uSelectedRecords", event.payload.selectedRecords);
    api.setState("uExceptedRecords", event.payload.exceptedRecords);
    if(event.payload.selectionCount != 0) {
        api.setState('isRemoveDisabled', false);
    } else {
        api.setState('isRemoveDisabled', true);
    }
}
