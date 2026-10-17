/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedTable = api.state.selectedTable;
    if(event.payload.checked) {
        selectedTable.push(event.payload.value);
    } else {
        var idx = selectedTable.indexOf(event.payload.value);
        selectedTable.splice(idx, 1);
    }
    api.setState("selectedTable", selectedTable);
    if(selectedTable.length == 1) {
        api.setState("disableCreateRule", false);
    } else api.setState("disableCreateRule", true);
}
