/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   let templateSysId = event.context.item.value.template_sys_id;
   let librarySysId = event.context.item.value.template_library;
   helpers.navigate.to('edit-assigned-tasks',{},{'query': '', 'librarySysId': librarySysId, 'templateSysId': templateSysId});
}
