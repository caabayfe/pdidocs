/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   const title = api.data.controller.current.listTitle;
   api.setState('currentTitleValue', title);
}
