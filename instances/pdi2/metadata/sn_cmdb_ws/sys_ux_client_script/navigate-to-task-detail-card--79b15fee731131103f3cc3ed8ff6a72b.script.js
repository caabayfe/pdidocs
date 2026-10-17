/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   var table = "reconcile_duplicate_task";
   var sysId = event.context.item.value.sysId;
   helpers.navigate.to('remediate-duplicate-task',{'table': table,'sysId': sysId},{},true);
}
