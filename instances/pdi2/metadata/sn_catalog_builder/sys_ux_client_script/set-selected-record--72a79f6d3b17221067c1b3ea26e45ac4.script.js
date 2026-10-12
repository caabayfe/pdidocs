/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const { selectionCount, selectedRecords } = event.payload;
    const { uiPolicyListRows } = api.state;

    api.setState('selectedRecords', {
        count: selectionCount,
        sysIds: selectedRecords
    });
}
