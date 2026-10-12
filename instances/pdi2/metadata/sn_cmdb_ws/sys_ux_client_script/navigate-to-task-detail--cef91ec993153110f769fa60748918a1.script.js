/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   var table = event.payload.table;
   var sysId = event.payload.sys_id;
   helpers.navigate.to('remediate-duplicate-task',{'table': table,'sysId': sysId},{},true);
}
