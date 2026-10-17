/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    const numOfRowsSelected = event.payload.selectionCount;
    api.setState('DisableAddGroups', numOfRowsSelected <= 0); //enable the button only if 1 or more rows are selected
}
