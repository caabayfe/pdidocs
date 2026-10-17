/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   var selectVal = event.payload.value;
   api.setState("showSelect", selectVal ? "SHOWSELECT" : "" ); 
}
