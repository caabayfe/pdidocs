/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   const title = api.data.controller.current.listTitle;
   var updatedTitle = title || '';
   if (title && title.length > 35) {
      updatedTitle = title.substring(0, 35);
   }
   api.setState('currentFieldValue',`${updatedTitle}_Copy`);
}
