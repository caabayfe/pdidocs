/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('selectionCount', event.payload.selectionCount);

    if (event.payload.allRecordsSelected == true) {
        api.setState('selectedSysIds', '');
    } else {
        var sysIds = event.payload.selectedRecords;
        api.setState('selectedSysIds', sysIds.toString());
    }
}
